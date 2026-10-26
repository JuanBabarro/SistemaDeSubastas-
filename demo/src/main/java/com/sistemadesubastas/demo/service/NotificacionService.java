package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.dto.response.NotificacionResponse;
import com.sistemadesubastas.demo.entity.*;
import com.sistemadesubastas.demo.enums.TipoNotificacion;
import com.sistemadesubastas.demo.repository.NotificacionRepository;
import com.sistemadesubastas.demo.repository.SeguimientoSubastaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final SeguimientoSubastaRepository seguimientoRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ─── Notificaciones de puja ───────────────────────────────────────────────

    public void notificarNuevaPuja(Subasta subasta, Puja puja, Usuario postor, Usuario liderAnterior) {
        String titulo = "Nueva oferta en " + subasta.getProducto().getNombre();
        String mensaje = postor.getUsername() + " ofertó $" + puja.getMonto();

        // Avisar al dueño en cada puja, aunque no siga su propia subasta.
        crearEventoYEnviar(subasta.getVendedor(), subasta, TipoNotificacion.NUEVA_PUJA, titulo, mensaje);

        // Notificar a cada seguidor activo en cada nueva puja (no deduplicar por subasta).
        List<SeguimientoSubasta> suscriptores = seguimientoRepository.findSuscriptoresActivos(subasta.getId());
        for (SeguimientoSubasta seg : suscriptores) {
            Long seguidorId = seg.getUsuario().getId();
            if (!seguidorId.equals(postor.getId()) && !seguidorId.equals(subasta.getVendedor().getId())) {
                crearEventoYEnviar(seg.getUsuario(), subasta, TipoNotificacion.NUEVA_PUJA, titulo, mensaje);
            }
        }

        if (liderAnterior != null && !liderAnterior.getId().equals(postor.getId())) {
            String tituloSuperada = "Tu oferta fue superada";
            String mensajeSuperada = postor.getUsername() + " ofertó $" + puja.getMonto()
                    + " en " + subasta.getProducto().getNombre();
            crearEventoYEnviar(liderAnterior, subasta, TipoNotificacion.OFERTA_SUPERADA,
                    tituloSuperada, mensajeSuperada);
        }

    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void publicarNuevaPuja(NuevaPujaRegistradaEvent event) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("tipo", "NUEVA_PUJA");
        payload.put("subastaId", event.subastaId());
        payload.put("precioActual", event.precioActual());
        payload.put("postorUsername", event.postorUsername());
        payload.put("monto", event.monto());
        payload.put("fechaHora", event.fechaHora().toString());
        messagingTemplate.convertAndSend("/topic/subastas/" + event.subastaId() + "/pujas", payload);
    }

    public void notificarOfertaSuperada(Usuario usuarioSuperado, Subasta subasta, Puja pujaGanadora) {
        String titulo = "Tu oferta fue superada";
        String mensaje = "Alguien ofertó $" + pujaGanadora.getMonto() + " en " + subasta.getProducto().getNombre();
        crearYEnviar(usuarioSuperado, subasta, TipoNotificacion.OFERTA_SUPERADA, titulo, mensaje);

        Map<String, Object> payload = new HashMap<>();
        payload.put("tipo", "OFERTA_SUPERADA");
        payload.put("subastaId", subasta.getId());
        payload.put("mensaje", mensaje);
        messagingTemplate.convertAndSendToUser(usuarioSuperado.getUsername(), "/queue/notificaciones", payload);
    }

    public void notificarSubastaCerrada(Subasta subasta) {
        String titulo = "Subasta cerrada: " + subasta.getProducto().getNombre();
        String mensaje = subasta.getGanador() != null
                ? "Ganador: " + subasta.getGanador().getUsername() + " con $" + subasta.getPrecioActual()
                : "La subasta quedó desierta";

        List<SeguimientoSubasta> suscriptores = seguimientoRepository.findSuscriptoresActivos(subasta.getId());
        suscriptores.forEach(seg ->
                crearYEnviar(seg.getUsuario(), subasta, TipoNotificacion.SUBASTA_CERRADA, titulo, mensaje));

        Map<String, Object> payload = new HashMap<>();
        payload.put("tipo", "SUBASTA_CERRADA");
        payload.put("subastaId", subasta.getId());
        payload.put("estado", subasta.getEstado().name());
        payload.put("ganador", subasta.getGanador() != null ? subasta.getGanador().getUsername() : null);
        payload.put("monto", subasta.getPrecioActual());
        messagingTemplate.convertAndSend("/topic/subastas/" + subasta.getId() + "/estado", payload);
    }

    public void notificarSubastaCancelada(Subasta subasta) {
        String titulo = "Subasta cancelada: " + subasta.getProducto().getNombre();
        String mensaje = "La subasta fue cancelada. Motivo: " + subasta.getMotivoCancelacion();

        List<SeguimientoSubasta> suscriptores = seguimientoRepository.findSuscriptoresActivos(subasta.getId());
        suscriptores.forEach(seg ->
                crearYEnviar(seg.getUsuario(), subasta, TipoNotificacion.SUBASTA_CANCELADA, titulo, mensaje));

        Map<String, Object> payload = new HashMap<>();
        payload.put("tipo", "SUBASTA_CANCELADA");
        payload.put("subastaId", subasta.getId());
        payload.put("motivo", subasta.getMotivoCancelacion());
        messagingTemplate.convertAndSend("/topic/subastas/" + subasta.getId() + "/estado", payload);
    }

    public void notificarSubastaPublicada(Subasta subasta) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("tipo", "SUBASTA_PUBLICADA");
        payload.put("subastaId", subasta.getId());
        payload.put("nombreProducto", subasta.getProducto().getNombre());
        payload.put("fechaInicio", subasta.getFechaInicio().toString());
        messagingTemplate.convertAndSend("/topic/subastas/nuevas", payload);
    }

    public void notificarCambioEstado(Subasta subasta) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("tipo", subasta.getEstado().name());
        payload.put("subastaId", subasta.getId());
        payload.put("fechaInicio", subasta.getFechaInicio().toString());
        payload.put("fechaFin", subasta.getFechaFin().toString());
        messagingTemplate.convertAndSend("/topic/subastas/" + subasta.getId() + "/estado", payload);
    }

    // ─── Lectura de notificaciones ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<NotificacionResponse> obtenerNotificaciones(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream().map(this::mapear).toList();
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> obtenerNoLeidas(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(usuarioId)
                .stream().map(this::mapear).toList();
    }

    public void marcarComoLeida(Long notificacionId, Long usuarioId) {
        notificacionRepository.marcarComoLeida(notificacionId, usuarioId);
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    private void crearYEnviar(Usuario destinatario, Subasta subasta,
                               TipoNotificacion tipo, String titulo, String mensaje) {
        // Evitar duplicados del mismo tipo para la misma subasta por usuario
        if (!notificacionRepository.existsByUsuarioIdAndSubastaIdAndTipo(
                destinatario.getId(), subasta.getId(), tipo)) {
            Notificacion notificacion = Notificacion.builder()
                    .usuario(destinatario)
                    .subasta(subasta)
                    .tipo(tipo)
                    .titulo(titulo)
                    .mensaje(mensaje)
                    .leida(false)
                    .build();
            notificacionRepository.save(notificacion);
        }
    }

    private void crearEventoYEnviar(Usuario destinatario, Subasta subasta,
                                    TipoNotificacion tipo, String titulo, String mensaje) {
        notificacionRepository.save(Notificacion.builder()
                .usuario(destinatario)
                .subasta(subasta)
                .tipo(tipo)
                .titulo(titulo)
                .mensaje(mensaje)
                .leida(false)
                .build());

        Map<String, Object> payload = new HashMap<>();
        payload.put("tipo", tipo.name());
        payload.put("subastaId", subasta.getId());
        payload.put("titulo", titulo);
        payload.put("mensaje", mensaje);
        messagingTemplate.convertAndSendToUser(destinatario.getUsername(), "/queue/notificaciones", payload);
    }

    private NotificacionResponse mapear(Notificacion n) {
        return NotificacionResponse.builder()
                .id(n.getId())
                .tipo(n.getTipo())
                .titulo(n.getTitulo())
                .mensaje(n.getMensaje())
                .fechaCreacion(n.getFechaCreacion())
                .leida(n.isLeida())
                .fechaLectura(n.getFechaLectura())
                .subastaId(n.getSubasta() != null ? n.getSubasta().getId() : null)
                .build();
    }
}
