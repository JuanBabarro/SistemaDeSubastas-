package com.sistemadesubastas.demo.repository;

import com.sistemadesubastas.demo.entity.Auditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {

    List<Auditoria> findByUsuarioIdOrderByFechaHoraDesc(Long usuarioId);

    Page<Auditoria> findByEntidadAfectadaAndIdentificadorEntidad(
            String entidadAfectada, Long identificadorEntidad, Pageable pageable);

    Page<Auditoria> findByFechaHoraBetween(
            LocalDateTime desde, LocalDateTime hasta, Pageable pageable);

    Page<Auditoria> findByTipoAccion(String tipoAccion, Pageable pageable);
}
