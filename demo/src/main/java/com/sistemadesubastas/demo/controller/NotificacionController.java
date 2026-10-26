package com.sistemadesubastas.demo.controller;

import com.sistemadesubastas.demo.dto.response.NotificacionResponse;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import com.sistemadesubastas.demo.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final UsuarioRepository usuarioRepository;

    /** GET /api/notificaciones */
    @GetMapping
    public ResponseEntity<List<NotificacionResponse>> todas(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(notificacionService.obtenerNotificaciones(usuarioId));
    }

    /** GET /api/notificaciones/no-leidas */
    @GetMapping("/no-leidas")
    public ResponseEntity<List<NotificacionResponse>> noLeidas(@AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(notificacionService.obtenerNoLeidas(usuarioId));
    }

    /** PATCH /api/notificaciones/{id}/leida */
    @PatchMapping("/{id}/leida")
    public ResponseEntity<Void> marcarLeida(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = resolverIdUsuario(userDetails);
        notificacionService.marcarComoLeida(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    // ---- Helper ----

    private Long resolverIdUsuario(UserDetails userDetails) {
        return usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException(userDetails.getUsername()))
                .getId();
    }
}
