package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.dto.request.ActualizarPerfilRequest;
import com.sistemadesubastas.demo.dto.response.SubastaResponse;
import com.sistemadesubastas.demo.dto.response.UsuarioResponse;
import com.sistemadesubastas.demo.entity.Usuario;
import com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final SubastaService subastaService;

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPerfil(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNoEncontradoException(usuarioId));
        return AuthService.mapearUsuarioResponse(usuario);
    }

    public UsuarioResponse actualizarPerfil(Long usuarioId, ActualizarPerfilRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNoEncontradoException(usuarioId));

        if (request.getNombre() != null)       usuario.setNombre(request.getNombre());
        if (request.getApellido() != null)     usuario.setApellido(request.getApellido());
        if (request.getFotoPerfilUrl() != null) usuario.setFotoPerfilUrl(request.getFotoPerfilUrl());

        // Cambio de email: verificar que no exista
        if (request.getEmail() != null && !request.getEmail().equals(usuario.getEmail())) {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("El email '" + request.getEmail() + "' ya está en uso");
            }
            usuario.setEmail(request.getEmail());
        }

        return AuthService.mapearUsuarioResponse(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public List<SubastaResponse> obtenerHistorialParticipacion(Long usuarioId) {
        return subastaService.obtenerSubastasDondeParticipoUsuario(usuarioId);
    }

    @Transactional(readOnly = true)
    public List<SubastaResponse> obtenerSubastasGanadas(Long usuarioId) {
        return subastaService.obtenerSubastasGanadasPorUsuario(usuarioId);
    }

    @Transactional(readOnly = true)
    public List<SubastaResponse> obtenerSubastasSeguidas(Long usuarioId) {
        return subastaService.obtenerSubastasDelVendedor(usuarioId); // delegado real en SeguimientoService
    }

    /**
     * Solo ADMIN puede cambiar el estado activo de un usuario.
     */
    public void cambiarEstadoCuenta(Long usuarioId, boolean activo) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNoEncontradoException(usuarioId));
        usuario.setActivo(activo);
        usuarioRepository.save(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(AuthService::mapearUsuarioResponse)
                .toList();
    }
}
