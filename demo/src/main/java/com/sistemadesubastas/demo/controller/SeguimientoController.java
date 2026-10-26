package com.sistemadesubastas.demo.controller;

import com.sistemadesubastas.demo.dto.response.SubastaResponse;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import com.sistemadesubastas.demo.service.SeguimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SeguimientoController {

    private final SeguimientoService seguimientoService;
    private final UsuarioRepository usuarioRepository;

    /** POST /api/subastas/{id}/seguir */
    @PostMapping("/subastas/{id}/seguir")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> seguir(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean notificaciones,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = resolverIdUsuario(userDetails);
        seguimientoService.seguirSubasta(usuarioId, id, notificaciones);
        return ResponseEntity.noContent().build();
    }

    /** DELETE /api/subastas/{id}/seguir */
    @DeleteMapping("/subastas/{id}/seguir")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> dejarDeSeguir(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = resolverIdUsuario(userDetails);
        seguimientoService.dejarDeSeguir(usuarioId, id);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/seguimientos — Subastas seguidas por el usuario. */
    @GetMapping("/seguimientos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SubastaResponse>> seguimientos(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(seguimientoService.obtenerSubastasSeguidas(usuarioId));
    }

    // ---- Helper ----

    private Long resolverIdUsuario(UserDetails userDetails) {
        return usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException(userDetails.getUsername()))
                .getId();
    }
}
