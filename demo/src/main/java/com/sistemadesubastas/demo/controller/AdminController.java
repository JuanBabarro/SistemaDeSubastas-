package com.sistemadesubastas.demo.controller;

import com.sistemadesubastas.demo.dto.request.CancelarSubastaRequest;
import com.sistemadesubastas.demo.dto.response.EstadisticasAdminResponse;
import com.sistemadesubastas.demo.dto.response.SubastaResponse;
import com.sistemadesubastas.demo.dto.response.UsuarioResponse;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import com.sistemadesubastas.demo.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UsuarioRepository usuarioRepository;

    /** GET /api/admin/estadisticas */
    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasAdminResponse> estadisticas() {
        return ResponseEntity.ok(adminService.obtenerEstadisticas());
    }

    /** GET /api/admin/estado */
    @GetMapping("/estado")
    public ResponseEntity<List<SubastaResponse>> estado() {
        return ResponseEntity.ok(adminService.listarSubastasActivas());
    }

    /** GET /api/admin/usuarios */
    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {
        return ResponseEntity.ok(adminService.listarUsuarios());
    }

    /** PATCH /api/admin/usuarios/{id}/estado */
    @PatchMapping("/usuarios/{id}/estado")
    public ResponseEntity<Void> cambiarEstadoCuenta(
            @PathVariable Long id,
            @RequestParam boolean activo,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = resolverIdUsuario(userDetails);
        adminService.cambiarEstadoCuenta(id, activo, adminId);
        return ResponseEntity.noContent().build();
    }

    /** POST /api/admin/subastas/{id}/cancelacion */
    @PostMapping("/subastas/{id}/cancelacion")
    public ResponseEntity<Void> cancelarSubasta(
            @PathVariable Long id,
            @RequestBody CancelarSubastaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long adminId = resolverIdUsuario(userDetails);
        adminService.cancelarSubastaAdmin(id, request, adminId);
        return ResponseEntity.noContent().build();
    }

    // ---- Helper ----

    private Long resolverIdUsuario(UserDetails userDetails) {
        return usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException(userDetails.getUsername()))
                .getId();
    }
}
