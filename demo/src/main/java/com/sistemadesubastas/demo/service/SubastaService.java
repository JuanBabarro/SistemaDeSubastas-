package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.dto.request.ActualizarSubastaRequest;
import com.sistemadesubastas.demo.dto.request.CancelarSubastaRequest;
import com.sistemadesubastas.demo.dto.request.CrearSubastaRequest;
import com.sistemadesubastas.demo.dto.response.FotoProductoResponse;
import com.sistemadesubastas.demo.dto.response.ResultadoSubastaResponse;
import com.sistemadesubastas.demo.dto.response.SubastaResponse;
import com.sistemadesubastas.demo.entity.Producto;
import com.sistemadesubastas.demo.entity.Puja;
import com.sistemadesubastas.demo.entity.Subasta;
import com.sistemadesubastas.demo.entity.Usuario;
import com.sistemadesubastas.demo.enums.EstadoProducto;
import com.sistemadesubastas.demo.enums.EstadoSubasta;
import com.sistemadesubastas.demo.enums.CategoriaProducto;
import com.sistemadesubastas.demo.exception.*;
import com.sistemadesubastas.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class SubastaService {

    private final SubastaRepository subastaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PujaRepository pujaRepository;
    private final FotoProductoRepository fotoProductoRepository;
    private final FotoProductoService fotoProductoService;
    private final NotificacionService notificacionService;

    // ─── Creación ────────────────────────────────────────────────────────────

    public SubastaResponse crearSubasta(CrearSubastaRequest request, Long vendedorId) {
        Usuario vendedor = usuarioRepository.findById(vendedorId)
                .orElseThrow(() -> new UsuarioNoEncontradoException(vendedorId));

        validarFechas(request.getFechaInicio(), request.getFechaFin());

        Producto producto = Producto.builder()
                .nombre(request.getNombreProducto())
                .descripcion(request.getDescripcionProducto())
                .categoria(CategoriaProducto.normalizar(request.getCategoriaProducto()))
                .marca(request.getMarcaProducto())
                .modelo(request.getModeloProducto())
                .vendedor(vendedor)
                .estado(EstadoProducto.DISPONIBLE)
                .build();
        producto = productoRepository.save(producto);

        Subasta subasta = Subasta.builder()
                .producto(producto)
                .vendedor(vendedor)
                .precioBase(request.getPrecioBase())
                .precioActual(request.getPrecioBase())
                .incrementoMinimo(request.getIncrementoMinimo())
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .estado(EstadoSubasta.BORRADOR)
                .build();

        subasta = subastaRepository.save(subasta);
        return mapearSubastaResponse(subasta);
    }

    public SubastaResponse publicarSubasta(Long subastaId, Long vendedorId) {
        Subasta subasta = obtenerSubastaPropiaOFallar(subastaId, vendedorId);

        if (subasta.getEstado() != EstadoSubasta.BORRADOR) {
            throw new IllegalArgumentException("Solo se puede publicar una subasta en estado BORRADOR");
        }
        if (fotoProductoRepository.findByProductoIdOrderByOrdenAsc(subasta.getProducto().getId()).isEmpty()) {
            throw new IllegalArgumentException("La publicación requiere al menos una foto del producto");
        }

        // Si la fecha de inicio ya llegó, activa directamente; si no, queda PROGRAMADA
        if (!LocalDateTime.now().isBefore(subasta.getFechaInicio())) {
            subasta.setEstado(EstadoSubasta.ACTIVA);
            subasta.getProducto().setEstado(EstadoProducto.EN_SUBASTA);
        } else {
            subasta.setEstado(EstadoSubasta.PROGRAMADA);
        }

        subasta = subastaRepository.save(subasta);
        notificacionService.notificarSubastaPublicada(subasta);
        notificacionService.notificarCambioEstado(subasta);
        return mapearSubastaResponse(subasta);
    }

    // ─── Consulta ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public SubastaResponse obtenerPorId(Long id) {
        return mapearSubastaResponse(
                subastaRepository.findById(id)
                        .orElseThrow(() -> new SubastaNoEncontradaException(id))
        );
    }

    @Transactional(readOnly = true)
    public Page<SubastaResponse> listarConFiltros(
            EstadoSubasta estado, String categoria, String busqueda,
            BigDecimal precioMin, BigDecimal precioMax, Pageable pageable) {
        String termino = busqueda == null ? "" : busqueda.trim();
        String categoriaFiltro = categoria == null ? "" : categoria.trim();
        return subastaRepository.buscarConFiltros(estado, categoriaFiltro, termino, precioMin, precioMax, pageable)
                .map(this::mapearSubastaResponse);
    }

    @Transactional(readOnly = true)
    public List<SubastaResponse> obtenerSubastasDelVendedor(Long vendedorId) {
        return subastaRepository.findByVendedorId(vendedorId).stream()
                .filter(s -> s.getEstado() != EstadoSubasta.BORRADOR)
                .filter(s -> !Boolean.TRUE.equals(s.getOcultaVendedor()))
                .map(this::mapearSubastaResponse).toList();
    }

    public void descartarBorrador(Long subastaId, Long vendedorId) {
        Subasta subasta = obtenerSubastaPropiaOFallar(subastaId, vendedorId);
        if (subasta.getEstado() != EstadoSubasta.BORRADOR) {
            throw new IllegalArgumentException("Solo se puede descartar un borrador incompleto");
        }
        Long productoId = subasta.getProducto().getId();
        Producto producto = subasta.getProducto();
        fotoProductoService.eliminarArchivosProducto(productoId);
        subastaRepository.delete(subasta);
        subastaRepository.flush();
        productoRepository.delete(producto);
    }

    public void eliminarDelHistorial(Long subastaId, Long vendedorId) {
        Subasta subasta = obtenerSubastaPropiaOFallar(subastaId, vendedorId);
        if (subasta.getEstado() == EstadoSubasta.BORRADOR
                || subasta.getEstado() == EstadoSubasta.ACTIVA
                || subasta.getEstado() == EstadoSubasta.PROGRAMADA) {
            throw new IllegalArgumentException("Primero debes cancelar la subasta antes de quitarla del historial");
        }
        subasta.setOcultaVendedor(true);
        subastaRepository.save(subasta);
    }

    @Transactional(readOnly = true)
    public List<SubastaResponse> obtenerSubastasDondeParticipoUsuario(Long usuarioId) {
        return pujaRepository.findByPostorIdOrderByFechaHoraDesc(usuarioId).stream()
                .map(Puja::getSubasta)
                .distinct()
                .map(this::mapearSubastaResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubastaResponse> obtenerSubastasGanadasPorUsuario(Long usuarioId) {
        return subastaRepository.findByGanadorId(usuarioId).stream()
                .map(this::mapearSubastaResponse)
                .toList();
    }

    // ─── Modificación ────────────────────────────────────────────────────────

    public SubastaResponse actualizarSubasta(Long subastaId, ActualizarSubastaRequest request, Long vendedorId) {
        Subasta subasta = obtenerSubastaPropiaOFallar(subastaId, vendedorId);

        if (subasta.getEstado() == EstadoSubasta.ACTIVA
                || subasta.getEstado() == EstadoSubasta.FINALIZADA
                || subasta.getEstado() == EstadoSubasta.CANCELADA) {
            throw new IllegalArgumentException("No se puede editar una subasta en estado " + subasta.getEstado());
        }

        if (request.getIncrementoMinimo() != null) subasta.setIncrementoMinimo(request.getIncrementoMinimo());
        if (request.getFechaInicio() != null) subasta.setFechaInicio(request.getFechaInicio());
        if (request.getFechaFin() != null) subasta.setFechaFin(request.getFechaFin());

        Producto p = subasta.getProducto();
        if (request.getNombreProducto() != null)      p.setNombre(request.getNombreProducto());
        if (request.getDescripcionProducto() != null) p.setDescripcion(request.getDescripcionProducto());
        if (request.getCategoriaProducto() != null)   p.setCategoria(CategoriaProducto.normalizar(request.getCategoriaProducto()));
        if (request.getMarcaProducto() != null)       p.setMarca(request.getMarcaProducto());
        if (request.getModeloProducto() != null)      p.setModelo(request.getModeloProducto());

        return mapearSubastaResponse(subastaRepository.save(subasta));
    }

    // ─── Cancelación ─────────────────────────────────────────────────────────

    public void cancelarSubasta(Long subastaId, CancelarSubastaRequest request, Long solicitanteId, boolean esAdmin) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new SubastaNoEncontradaException(subastaId));

        if (!esAdmin && !subasta.getVendedor().getId().equals(solicitanteId)) {
            throw new PermisoDenegadoException("No tiene permiso para cancelar esta subasta");
        }

        if (subasta.getEstado() == EstadoSubasta.FINALIZADA || subasta.getEstado() == EstadoSubasta.CANCELADA) {
            throw new CancelacionNoPermitidaException("La subasta ya está " + subasta.getEstado());
        }

        subasta.setEstado(EstadoSubasta.CANCELADA);
        subasta.setMotivoCancelacion(request.getMotivo());
        subasta.setFechaCierreReal(LocalDateTime.now());
        subasta.getProducto().setEstado(EstadoProducto.DISPONIBLE);
        subastaRepository.save(subasta);
        notificacionService.notificarSubastaCancelada(subasta);
    }

    // ─── Activación de subastas programadas (llamado por el scheduler) ────────

    public void activarSubastasProgramadas() {
        List<Subasta> aActivar = subastaRepository.findSubastasParaActivar(LocalDateTime.now());
        for (Subasta subasta : aActivar) {
            subasta.setEstado(EstadoSubasta.ACTIVA);
            subasta.getProducto().setEstado(EstadoProducto.EN_SUBASTA);
            subastaRepository.save(subasta);
            notificacionService.notificarCambioEstado(subasta);
        }
    }

    // ─── Cierre automático idempotente (llamado por el scheduler) ────────────

    public void cerrarSubastasPendientes() {
        List<Subasta> aVencer = subastaRepository.findSubastasParaCerrar(LocalDateTime.now());
        for (Subasta subasta : aVencer) {
            cerrarSubasta(subasta.getId());
        }
    }

    @Transactional
    public void cerrarSubasta(Long subastaId) {
        // Bloqueo pesimista para evitar race condition con pujas simultáneas
        Subasta subasta = subastaRepository.findByIdConBloqueo(subastaId)
                .orElseThrow(() -> new SubastaNoEncontradaException(subastaId));

        // Idempotencia: si ya no está activa, no hacer nada
        if (subasta.getEstado() != EstadoSubasta.ACTIVA) {
            return;
        }

        Optional<Puja> pujaGanadora = pujaRepository.findPujaGanadora(subastaId);

        subasta.setFechaCierreReal(LocalDateTime.now());

        if (pujaGanadora.isPresent()) {
            subasta.setEstado(EstadoSubasta.FINALIZADA);
            subasta.setGanador(pujaGanadora.get().getPostor());
            subasta.setPujaGanadora(pujaGanadora.get());
            subasta.getProducto().setEstado(EstadoProducto.VENDIDO);
        } else {
            subasta.setEstado(EstadoSubasta.DESIERTA);
            subasta.getProducto().setEstado(EstadoProducto.DISPONIBLE);
        }

        subastaRepository.save(subasta);
        notificacionService.notificarSubastaCerrada(subasta);
    }

    // ─── Resultado ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ResultadoSubastaResponse obtenerResultado(Long subastaId) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new SubastaNoEncontradaException(subastaId));

        return ResultadoSubastaResponse.builder()
                .subastaId(subasta.getId())
                .estadoFinal(subasta.getEstado())
                .ganador(subasta.getGanador() != null ? AuthService.mapearUsuarioResponse(subasta.getGanador()) : null)
                .montoGanador(subasta.getPujaGanadora() != null ? subasta.getPujaGanadora().getMonto() : null)
                .fechaCierre(subasta.getFechaCierreReal())
                .desierta(subasta.getEstado() == EstadoSubasta.DESIERTA)
                .motivoCancelacion(subasta.getMotivoCancelacion())
                .build();
    }

    // ─── Helpers privados ────────────────────────────────────────────────────

    private Subasta obtenerSubastaPropiaOFallar(Long subastaId, Long vendedorId) {
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new SubastaNoEncontradaException(subastaId));
        if (!subasta.getVendedor().getId().equals(vendedorId)) {
            throw new PermisoDenegadoException("No tiene permiso sobre esta subasta");
        }
        return subasta;
    }

    private void validarFechas(LocalDateTime inicio, LocalDateTime fin) {
        if (!fin.isAfter(inicio)) {
            throw new IllegalArgumentException("La fecha de fin debe ser posterior a la de inicio");
        }
        if (Duration.between(inicio, fin).toMinutes() < 1) {
            throw new IllegalArgumentException("La duración mínima de una subasta es de 1 minuto");
        }
    }

    // ─── Mapeo a DTO ─────────────────────────────────────────────────────────

    public SubastaResponse mapearSubastaResponse(Subasta s) {
        long segundosRestantes = 0;
        if (s.getEstado() == EstadoSubasta.ACTIVA && s.getFechaFin() != null) {
            segundosRestantes = Math.max(0, Duration.between(LocalDateTime.now(), s.getFechaFin()).getSeconds());
        }

        long cantidadPujas = pujaRepository.countBySubastaId(s.getId());

        List<FotoProductoResponse> fotos = fotoProductoRepository
                .findByProductoIdOrderByOrdenAsc(s.getProducto().getId()).stream()
                .map(f -> FotoProductoResponse.builder()
                        .id(f.getId())
                        .url(f.getUrl())
                        .nombreArchivo(f.getNombreArchivo())
                        .tipoContenido(f.getTipoContenido())
                        .orden(f.getOrden())
                        .esPrincipal(f.isEsPrincipal())
                        .fechaSubida(f.getFechaSubida())
                        .build())
                .toList();

        return SubastaResponse.builder()
                .id(s.getId())
                .productoId(s.getProducto().getId())
                .nombreProducto(s.getProducto().getNombre())
                .descripcionProducto(s.getProducto().getDescripcion())
                .categoriaProducto(s.getProducto().getCategoria())
                .marcaProducto(s.getProducto().getMarca())
                .modeloProducto(s.getProducto().getModelo())
                .fotos(fotos)
                .vendedorId(s.getVendedor().getId())
                .vendedorUsername(s.getVendedor().getUsername())
                .precioBase(s.getPrecioBase())
                .precioActual(s.getPrecioActual())
                .incrementoMinimo(s.getIncrementoMinimo())
                .fechaCreacion(s.getFechaCreacion())
                .fechaInicio(s.getFechaInicio())
                .fechaFin(s.getFechaFin())
                .segundosRestantes(segundosRestantes)
                .estado(s.getEstado())
                .cantidadPujas(cantidadPujas)
                .ganador(s.getGanador() != null && s.getEstado() == EstadoSubasta.FINALIZADA
                        ? AuthService.mapearUsuarioResponse(s.getGanador()) : null)
                .build();
    }
}
