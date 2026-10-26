package com.sistemadesubastas.demo.controller;

import com.sistemadesubastas.demo.dto.request.LoginRequest;
import com.sistemadesubastas.demo.dto.request.RegistroUsuarioRequest;
import com.sistemadesubastas.demo.dto.response.UsuarioResponse;
import com.sistemadesubastas.demo.exception.CredencialesInvalidasException;
import com.sistemadesubastas.demo.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository securityContextRepository;

    /** POST /api/auth/registro — Registro público, no requiere autenticación. */
    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(
            @Valid @RequestBody RegistroUsuarioRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        UsuarioResponse response = authService.registrar(request);
        iniciarSesion(request.getUsername(), request.getPassword(), httpRequest, httpResponse);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * POST /api/auth/login — autentica con Spring Security y persiste la sesión HTTP.
     */
    @PostMapping("/login")
    public ResponseEntity<UsuarioResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        Authentication authentication = iniciarSesion(
                request.getUsernameOrEmail(), request.getPassword(), httpRequest, httpResponse);
        UsuarioResponse response = authService.obtenerUsuarioActual(authentication.getName());
        return ResponseEntity.ok(response);
    }

    /** POST /api/auth/logout — La sesión la invalida Spring Security. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        if (request.getSession(false) != null) {
            request.getSession(false).invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    /** GET /api/auth/me — Datos del usuario autenticado actual. */
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> me(@AuthenticationPrincipal UserDetails userDetails) {
        UsuarioResponse response = authService.obtenerUsuarioActual(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    private Authentication iniciarSesion(
            String usernameOrEmail,
            String password,
            HttpServletRequest request,
            HttpServletResponse response) {
        final Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(usernameOrEmail, password));
        } catch (AuthenticationException ex) {
            throw new CredencialesInvalidasException();
        }

        if (request.getSession(false) != null) {
            request.changeSessionId();
        }
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);
        return authentication;
    }
}
