package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.dto.request.CrearPujaRequest;
import com.sistemadesubastas.demo.dto.response.PujaResponse;
import com.sistemadesubastas.demo.dto.response.ResultadoPujaResponse;
import com.sistemadesubastas.demo.entity.Puja;
import com.sistemadesubastas.demo.entity.Subasta;
import com.sistemadesubastas.demo.entity.Usuario;
import com.sistemadesubastas.demo.enums.EstadoPuja;
import com.sistemadesubastas.demo.enums.EstadoSubasta;
import com.sistemadesubastas.demo.exception.*;
import com.sistemadesubastas.demo.repository.PujaRepository;
import com.sistemadesubastas.demo.repository.SubastaRepository;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PujaService {

    private final PujaRepository pujaRepository;
    private final SubastaRepository subastaRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionService notificacionService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Registra una nueva puja de forma atómica con bloqueo pesimista.
     * <p>
     * Flujo:
     * 1. Verificar idempotencia (solicitud duplicada).
     * 2. Obtener subasta con bloqueo PESSIMISTIC_WRITE.
     * 3. Validar estado ACTIVA y plazo vigente.
     * 4. Validar que el postor no sea el vendedor.
     * 5. Validar monto mínimo.
     * 6. Registrar puja y actualizar precio actual en la misma transacción.
     * 7. Emitir notificaciones DESPUÉS de confirmar la transacción.
     */
    public ResultadoPujaResponse realizarPuja(Long subastaId, CrearPujaRequest request, Long postorId) {

        // 1. Idempotencia: rechazar solicitudes duplicadas
        if (request.getIdentificadorSolicitud() != null &&
                pujaRepository.existsByIdentificadorSolicitud(request.getIdentificadorSolicitud())) {
            Puja existente = pujaRepository.findByIdentificadorSolicitud(request.getIdentificadorSolicitud()).get();
            return ResultadoPujaResponse.builder()
                    .aceptada(true)
                    .precioActual(existente.getMonto())
                    .mensaje("Puja ya registrada (solicitud duplicada)")
                    .build();
        }

        // 2. Subasta con bloqueo pesimista
        Subasta subasta = subastaRepository.findByIdConBloqueo(subastaId)
                .orElseThrow(() -> new SubastaNoEncontradaException(subastaId));

        // 3. Estado y plazo
        if (subasta.getEstado() != EstadoSubasta.ACTIVA) {
            throw new SubastaNoActivaException(subastaId);
        }
        if (LocalDateTime.now().isAfter(subasta.getFechaFin())) {
            throw new SubastaNoActivaException("La subasta ya cerró");
        }

        Usuario postor = usuarioRepository.findById(postorId)
                .orElseThrow(() -> new UsuarioNoEncontradoException(postorId));

        if (!postor.isActivo()) {
            throw new PujaInvalidaException("El usuario no está activo");
        }

        // 4. Vendedor no puede pujar en su propia subasta
        if (subasta.getVendedor().getId().equals(postorId)) {
            throw new PujaInvalidaException("El vendedor no puede pujar en su propia subasta");
        }

        // 5. Monto mínimo
        BigDecimal montoMinimo = subasta.getPrecioActual().add(subasta.getIncrementoMinimo());
        if (request.getMonto().compareTo(montoMinimo) < 0) {
            return ResultadoPujaResponse.builder()
                    .aceptada(false)
                    .precioActual(subasta.getPrecioActual())
                    .montoSuperado(subasta.getPrecioActual())
                    .mensaje("El monto no alcanza el mínimo requerido")
                    .motivoRechazo("Monto mínimo requerido: " + montoMinimo)
                    .build();
        }

        Puja pujaLiderAnterior = pujaRepository.findPujaGanadora(subastaId).orElse(null);

        // 6. Registrar puja y actualizar precio en la misma transacción
        Puja puja = Puja.builder()
                .subasta(subasta)
                .postor(postor)
                .monto(request.getMonto())
                .estado(EstadoPuja.ACEPTADA)
                .identificadorSolicitud(request.getIdentificadorSolicitud())
                .build();
        pujaRepository.save(puja);

        subasta.setPrecioActual(request.getMonto());
        subastaRepository.save(subasta);

        // 7. Persistir notificaciones; el broadcast WebSocket se envía después del commit.
        notificacionService.notificarNuevaPuja(subasta, puja, postor,
            pujaLiderAnterior != null ? pujaLiderAnterior.getPostor() : null);
        eventPublisher.publishEvent(new NuevaPujaRegistradaEvent(
            subasta.getId(), subasta.getPrecioActual(), postor.getUsername(),
            puja.getMonto(), puja.getFechaHora()));

        return ResultadoPujaResponse.builder()
                .aceptada(true)
                .precioActual(request.getMonto())
                .mensaje("Puja registrada con éxito")
                .build();
    }

    // ---- Consultas ----

    @Transactional(readOnly = true)
    public List<PujaResponse> listarPujasPorSubasta(Long subastaId) {
        return pujaRepository.findBySubastaIdAndEstadoOrderByFechaHoraAsc(subastaId, EstadoPuja.ACEPTADA)
                .stream().map(this::mapear).toList();
    }

    @Transactional(readOnly = true)
    public List<PujaResponse> listarPujasPorPostor(Long postorId) {
        return pujaRepository.findByPostorIdOrderByFechaHoraDesc(postorId)
                .stream().map(this::mapear).toList();
    }

    // ---- Mapeo ----

    private PujaResponse mapear(Puja p) {
        return PujaResponse.builder()
                .id(p.getId())
                .subastaId(p.getSubasta().getId())
                .postorId(p.getPostor().getId())
                .postorUsername(p.getPostor().getUsername())
                .monto(p.getMonto())
                .fechaHora(p.getFechaHora())
                .estado(p.getEstado())
                .build();
    }
}
