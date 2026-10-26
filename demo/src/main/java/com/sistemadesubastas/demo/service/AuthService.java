package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.dto.request.LoginRequest;
import com.sistemadesubastas.demo.dto.request.RegistroUsuarioRequest;
import com.sistemadesubastas.demo.dto.response.UsuarioResponse;
import com.sistemadesubastas.demo.entity.Usuario;
import com.sistemadesubastas.demo.enums.RolUsuario;
import com.sistemadesubastas.demo.exception.CredencialesInvalidasException;
import com.sistemadesubastas.demo.exception.UsuarioDuplicadoException;
import com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de autenticación y registro de usuarios.
 * Delega la validación de credenciales en Spring Security;
 * este servicio gestiona el registro y la lógica adicional de sesión.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
    * Registra un usuario como POSTOR o VENDEDOR según el tipo de cuenta elegido.
    * ADMIN nunca puede asignarse a través del registro público.
     * Valida duplicados de username y email antes de persistir.
     */
    public UsuarioResponse registrar(RegistroUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new UsuarioDuplicadoException("El username '" + request.getUsername() + "' ya está en uso");
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new UsuarioDuplicadoException("El email '" + request.getEmail() + "' ya está registrado");
        }

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol("VENDEDOR".equals(request.getRol()) ? RolUsuario.VENDEDOR : RolUsuario.POSTOR)
                .activo(true)
                .build();

        usuario = usuarioRepository.save(usuario);
        return mapearUsuarioResponse(usuario);
    }

    /**
     * Verifica las credenciales del usuario.
     * Spring Security se integra aquí a través de UserDetailsService.
     */
    @Transactional(readOnly = true)
    public UsuarioResponse autenticar(LoginRequest request) {
        // Busca por username o email
        Usuario usuario = usuarioRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> usuarioRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(CredencialesInvalidasException::new);

        if (!usuario.isActivo()) {
            throw new CredencialesInvalidasException("La cuenta está inactiva");
        }
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new CredencialesInvalidasException();
        }

        return mapearUsuarioResponse(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerUsuarioActual(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsuarioNoEncontradoException(username));
        return mapearUsuarioResponse(usuario);
    }

    // ---- Mapeo ----

    public static UsuarioResponse mapearUsuarioResponse(Usuario u) {
        return UsuarioResponse.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .username(u.getUsername())
                .email(u.getEmail())
                .rol(u.getRol())
                .fotoPerfilUrl(u.getFotoPerfilUrl())
                .activo(u.isActivo())
                .fechaRegistro(u.getFechaRegistro())
                .build();
    }
}
