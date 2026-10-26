package com.sistemadesubastas.demo.repository;

import com.sistemadesubastas.demo.entity.SeguimientoSubasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeguimientoSubastaRepository extends JpaRepository<SeguimientoSubasta, Long> {

    List<SeguimientoSubasta> findByUsuarioId(Long usuarioId);

    List<SeguimientoSubasta> findBySubastaId(Long subastaId);

    Optional<SeguimientoSubasta> findByUsuarioIdAndSubastaId(Long usuarioId, Long subastaId);

    boolean existsByUsuarioIdAndSubastaId(Long usuarioId, Long subastaId);

    void deleteByUsuarioIdAndSubastaId(Long usuarioId, Long subastaId);

    /** Usuarios que siguen una subasta y tienen notificaciones activas. */
    @Query("SELECT s FROM SeguimientoSubasta s WHERE s.subasta.id = :subastaId AND s.notificacionesActivas = true")
    List<SeguimientoSubasta> findSuscriptoresActivos(@Param("subastaId") Long subastaId);
}
