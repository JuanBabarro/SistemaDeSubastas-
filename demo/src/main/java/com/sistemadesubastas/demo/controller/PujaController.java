package com.sistemadesubastas.demo.controller;

import com.sistemadesubastas.demo.dto.request.CrearPujaRequest;
import com.sistemadesubastas.demo.dto.response.PujaResponse;
import com.sistemadesubastas.demo.dto.response.ResultadoPujaResponse;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import com.sistemadesubastas.demo.service.PujaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PujaController {

    private final PujaService pujaService;
    private final UsuarioRepository usuarioRepository;

    /** POST /api/subastas/{id}/pujas — Realizar una puja. */
    @PostMapping("/api/subastas/{id}/pujas")
    @PreAuthorize("hasAnyRole('POSTOR','VENDEDOR','ADMIN')")
    public ResponseEntity<ResultadoPujaResponse> pujar(
            @PathVariable Long id,
            @Valid @RequestBody CrearPujaRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long postorId = resolverIdUsuario(userDetails);
        ResultadoPujaResponse resultado = pujaService.realizarPuja(id, request, postorId);
        return ResponseEntity.ok(resultado);
    }

    /** GET /api/subastas/{id}/pujas — Historial de pujas de una subasta (público). */
    @GetMapping("/api/subastas/{id}/pujas")
    public ResponseEntity<List<PujaResponse>> listarPujasPorSubasta(@PathVariable Long id) {
        return ResponseEntity.ok(pujaService.listarPujasPorSubasta(id));
    }

    /** GET /api/pujas/mias — Pujas del usuario autenticado. */
    @GetMapping("/api/pujas/mias")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PujaResponse>> misPujas(@AuthenticationPrincipal UserDetails userDetails) {
        Long postorId = resolverIdUsuario(userDetails);
        return ResponseEntity.ok(pujaService.listarPujasPorPostor(postorId));
    }

    // ---- Helper ----

    private Long resolverIdUsuario(UserDetails userDetails) {
        return usuarioRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException(userDetails.getUsername()))
                .getId();
    }
}
