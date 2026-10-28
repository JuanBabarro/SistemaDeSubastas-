package com.sistemadesubastas.demo.controller;

import com.sistemadesubastas.demo.dto.request.AlertaInteresRequest;
import com.sistemadesubastas.demo.dto.response.AlertaInteresResponse;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import com.sistemadesubastas.demo.service.AlertaInteresService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertas-interes")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AlertaInteresController {

    private final AlertaInteresService alertaService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    public ResponseEntity<List<AlertaInteresResponse>> listar(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(alertaService.listar(resolverIdUsuario(user)));
    }

    @PostMapping
    public ResponseEntity<AlertaInteresResponse> crear(
            @Valid @RequestBody AlertaInteresRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(alertaService.crear(resolverIdUsuario(user), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlertaInteresResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody AlertaInteresRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(alertaService.actualizar(resolverIdUsuario(user), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, @AuthenticationPrincipal UserDetails user) {
        alertaService.eliminar(resolverIdUsuario(user), id);
        return ResponseEntity.noContent().build();
    }

    private Long resolverIdUsuario(UserDetails userDetails) {
        return usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException(userDetails.getUsername()))
                .getId();
    }
}
