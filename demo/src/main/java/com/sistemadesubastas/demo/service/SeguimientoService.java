package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.dto.response.SubastaResponse;
import com.sistemadesubastas.demo.entity.SeguimientoSubasta;
import com.sistemadesubastas.demo.entity.Subasta;
import com.sistemadesubastas.demo.entity.Usuario;
import com.sistemadesubastas.demo.exception.SubastaNoEncontradaException;
import com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException;
import com.sistemadesubastas.demo.repository.SeguimientoSubastaRepository;
import com.sistemadesubastas.demo.repository.SubastaRepository;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SeguimientoService {

    private final SeguimientoSubastaRepository seguimientoRepository;
    private final SubastaRepository subastaRepository;
    private final UsuarioRepository usuarioRepository;
    private final SubastaService subastaService;

    public void seguirSubasta(Long usuarioId, Long subastaId, boolean notificacionesActivas) {
        if (seguimientoRepository.existsByUsuarioIdAndSubastaId(usuarioId, subastaId)) {
            throw new IllegalArgumentException("Ya estás siguiendo esta subasta");
        }

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNoEncontradoException(usuarioId));
        Subasta subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new SubastaNoEncontradaException(subastaId));

        SeguimientoSubasta seguimiento = SeguimientoSubasta.builder()
                .usuario(usuario)
                .subasta(subasta)
                .notificacionesActivas(notificacionesActivas)
                .build();

        seguimientoRepository.save(seguimiento);
    }

    public void dejarDeSeguir(Long usuarioId, Long subastaId) {
        seguimientoRepository.deleteByUsuarioIdAndSubastaId(usuarioId, subastaId);
    }

    @Transactional(readOnly = true)
    public List<SubastaResponse> obtenerSubastasSeguidas(Long usuarioId) {
        return seguimientoRepository.findByUsuarioId(usuarioId).stream()
                .map(s -> subastaService.mapearSubastaResponse(s.getSubasta()))
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean estaSiguiendo(Long usuarioId, Long subastaId) {
        return seguimientoRepository.existsByUsuarioIdAndSubastaId(usuarioId, subastaId);
    }
}
