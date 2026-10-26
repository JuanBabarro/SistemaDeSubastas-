package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.entity.Auditoria;
import com.sistemadesubastas.demo.entity.Usuario;
import com.sistemadesubastas.demo.repository.AuditoriaRepository;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Registra una acción en la auditoría.
     * Usa REQUIRES_NEW para garantizar que el registro se persiste
     * incluso si la transacción principal hace rollback.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(Long usuarioId, String tipoAccion,
                          String entidadAfectada, Long identificadorEntidad,
                          String detalle, String resultado) {
        try {
            Auditoria auditoria = Auditoria.builder()
                    .tipoAccion(tipoAccion)
                    .entidadAfectada(entidadAfectada)
                    .identificadorEntidad(identificadorEntidad)
                    .detalle(detalle)
                    .resultado(resultado)
                    .build();

            if (usuarioId != null) {
                usuarioRepository.findById(usuarioId).ifPresent(auditoria::setUsuario);
            }

            auditoriaRepository.save(auditoria);
        } catch (Exception e) {
            // La auditoría nunca debe interrumpir el flujo principal
            log.error("Error al registrar auditoría: {}", e.getMessage(), e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarError(Long usuarioId, String tipoAccion, String entidad,
                               Long entidadId, String detalle) {
        registrar(usuarioId, tipoAccion, entidad, entidadId, detalle, "ERROR");
    }
}
