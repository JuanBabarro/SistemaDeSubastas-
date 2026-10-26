package com.sistemadesubastas.demo.controller;

import com.sistemadesubastas.demo.dto.request.ActualizarPerfilRequest;
import com.sistemadesubastas.demo.dto.response.SubastaResponse;
import com.sistemadesubastas.demo.dto.response.UsuarioResponse;
import com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import com.sistemadesubastas.demo.service.SeguimientoService;
import com.sistemadesubastas.demo.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final SeguimientoService seguimientoService;
    private final UsuarioRepository usuarioRepository;

    /** GET /api/usuarios/me */
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> obtenerPerfil(@AuthenticationPrincipal UserDetails userDetails) {
        Long id = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(usuarioService.obtenerPerfil(id));
    }

    /** PUT /api/usuarios/me */
    @PutMapping("/me")
    public ResponseEntity<UsuarioResponse> actualizarPerfil(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ActualizarPerfilRequest request) {
        Long id = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(usuarioService.actualizarPerfil(id, request));
    }

    /** GET /api/usuarios/me/historial — Subastas en las que participó el usuario. */
    @GetMapping("/me/historial")
    public ResponseEntity<List<SubastaResponse>> historial(@AuthenticationPrincipal UserDetails userDetails) {
        Long id = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(usuarioService.obtenerHistorialParticipacion(id));
    }

    /** GET /api/usuarios/me/ganadas — Subastas ganadas por el usuario. */
    @GetMapping("/me/ganadas")
    public ResponseEntity<List<SubastaResponse>> ganadas(@AuthenticationPrincipal UserDetails userDetails) {
        Long id = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(usuarioService.obtenerSubastasGanadas(id));
    }

    /** GET /api/usuarios/me/seguimientos — Subastas que sigue el usuario. */
    @GetMapping("/me/seguimientos")
    public ResponseEntity<List<SubastaResponse>> seguimientos(@AuthenticationPrincipal UserDetails userDetails) {
        Long id = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(seguimientoService.obtenerSubastasSeguidas(id));
    }

    // ─── Helper ──────────────────────────────────────────────────────────────

    private Long resolverIdUsuario(UserDetails userDetails) {
        return usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new UsuarioNoEncontradoException(userDetails.getUsername()))
                .getId();
    }
}
