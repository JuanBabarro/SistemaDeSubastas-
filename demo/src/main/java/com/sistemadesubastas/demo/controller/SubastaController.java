package com.sistemadesubastas.demo.controller;

import com.sistemadesubastas.demo.dto.request.ActualizarOrdenFotosRequest;
import com.sistemadesubastas.demo.dto.request.ActualizarSubastaRequest;
import com.sistemadesubastas.demo.dto.request.CancelarSubastaRequest;
import com.sistemadesubastas.demo.dto.request.CrearSubastaRequest;
import com.sistemadesubastas.demo.dto.response.FotoProductoResponse;
import com.sistemadesubastas.demo.dto.response.ResultadoSubastaResponse;
import com.sistemadesubastas.demo.dto.response.SubastaResponse;
import com.sistemadesubastas.demo.enums.EstadoSubasta;
import com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import com.sistemadesubastas.demo.service.FotoProductoService;
import com.sistemadesubastas.demo.service.SubastaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/subastas")
@RequiredArgsConstructor
public class SubastaController {

    private final SubastaService subastaService;
    private final FotoProductoService fotoService;
    private final UsuarioRepository usuarioRepository;

    /** POST /api/subastas — Requiere rol VENDEDOR o ADMIN. */
    @PostMapping
    @PreAuthorize("hasAnyRole('VENDEDOR','ADMIN')")
    public ResponseEntity<SubastaResponse> crear(
            @Valid @RequestBody CrearSubastaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long vendedorId = resolverIdUsuario(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(subastaService.crearSubasta(request, vendedorId));
    }

    /** GET /api/subastas — Listado público con filtros y paginación. */
    @GetMapping
    public ResponseEntity<Page<SubastaResponse>> listar(
            @RequestParam(required = false) EstadoSubasta estado,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) BigDecimal precioMin,
            @RequestParam(required = false) BigDecimal precioMax,
            @PageableDefault(size = 20, sort = "fechaFin") Pageable pageable) {
        return ResponseEntity.ok(subastaService.listarConFiltros(estado, categoria, precioMin, precioMax, pageable));
    }

    /** GET /api/subastas/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<SubastaResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(subastaService.obtenerPorId(id));
    }

    /** PUT /api/subastas/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDEDOR','ADMIN')")
    public ResponseEntity<SubastaResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarSubastaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long vendedorId = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(subastaService.actualizarSubasta(id, request, vendedorId));
    }

    /** POST /api/subastas/{id}/publicacion */
    @PostMapping("/{id}/publicacion")
    @PreAuthorize("hasAnyRole('VENDEDOR','ADMIN')")
    public ResponseEntity<SubastaResponse> publicar(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long vendedorId = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(subastaService.publicarSubasta(id, vendedorId));
    }

    /** POST /api/subastas/{id}/cancelacion */
    @PostMapping("/{id}/cancelacion")
    @PreAuthorize("hasAnyRole('VENDEDOR','ADMIN')")
    public ResponseEntity<Void> cancelar(
            @PathVariable Long id,
            @RequestBody(required = false) CancelarSubastaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long solicitanteId = resolverIdUsuario(userDetails);
        boolean esAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        subastaService.cancelarSubasta(id, request != null ? request : new CancelarSubastaRequest(), solicitanteId, esAdmin);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/subastas/{id}/resultado */
    @GetMapping("/{id}/resultado")
    public ResponseEntity<ResultadoSubastaResponse> resultado(@PathVariable Long id) {
        return ResponseEntity.ok(subastaService.obtenerResultado(id));
    }

    /** GET /api/subastas/mias — Subastas del vendedor autenticado. */
    @GetMapping("/mias")
    @PreAuthorize("hasAnyRole('VENDEDOR','ADMIN')")
    public ResponseEntity<List<SubastaResponse>> mias(@AuthenticationPrincipal UserDetails userDetails) {
        Long vendedorId = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(subastaService.obtenerSubastasDelVendedor(vendedorId));
    }

    // ─── Fotos del producto de la subasta ────────────────────────────────────

    /** POST /api/subastas/{id}/fotos */
    @PostMapping(value = "/{id}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('VENDEDOR','ADMIN')")
    public ResponseEntity<FotoProductoResponse> subirFoto(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long productoId = subastaService.obtenerPorId(id).getProductoId();
        Long usuarioId = resolverIdUsuario(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(fotoService.subirFoto(productoId, archivo, usuarioId));
    }

    /** DELETE /api/subastas/{id}/fotos/{fotoId} */
    @DeleteMapping("/{id}/fotos/{fotoId}")
    @PreAuthorize("hasAnyRole('VENDEDOR','ADMIN')")
    public ResponseEntity<Void> eliminarFoto(
            @PathVariable Long id,
            @PathVariable Long fotoId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long productoId = subastaService.obtenerPorId(id).getProductoId();
        Long usuarioId = resolverIdUsuario(userDetails);
        fotoService.eliminarFoto(productoId, fotoId, usuarioId);
        return ResponseEntity.noContent().build();
    }

    /** PUT /api/subastas/{id}/fotos/orden */
    @PutMapping("/{id}/fotos/orden")
    @PreAuthorize("hasAnyRole('VENDEDOR','ADMIN')")
    public ResponseEntity<Void> actualizarOrdenFotos(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarOrdenFotosRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long productoId = subastaService.obtenerPorId(id).getProductoId();
        Long usuarioId = resolverIdUsuario(userDetails);
        fotoService.actualizarOrden(productoId, request, usuarioId);
        return ResponseEntity.noContent().build();
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private Long resolverIdUsuario(UserDetails userDetails) {
        return usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsuarioNoEncontradoException(userDetails.getUsername()))
                .getId();
    }
}
