package com.sistemadesubastas.demo.repository;

import com.sistemadesubastas.demo.entity.Subasta;
import com.sistemadesubastas.demo.enums.EstadoSubasta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubastaRepository extends JpaRepository<Subasta, Long> {

    // ---- Búsquedas básicas ----

    List<Subasta> findByEstado(EstadoSubasta estado);

    List<Subasta> findByVendedorId(Long vendedorId);

    Page<Subasta> findByEstado(EstadoSubasta estado, Pageable pageable);

    Page<Subasta> findAll(Pageable pageable);

    // ---- Filtros compuestos ----

    @Query("SELECT s FROM Subasta s JOIN s.producto p " +
           "WHERE s.estado <> 'BORRADOR' " +
           "AND (:estado IS NULL OR s.estado = :estado) " +
           "AND (:categoria IS NULL OR p.categoria = :categoria) " +
           "AND (:precioMin IS NULL OR s.precioActual >= :precioMin) " +
           "AND (:precioMax IS NULL OR s.precioActual <= :precioMax)")
    Page<Subasta> buscarConFiltros(
            @Param("estado") EstadoSubasta estado,
            @Param("categoria") String categoria,
            @Param("precioMin") BigDecimal precioMin,
            @Param("precioMax") BigDecimal precioMax,
            Pageable pageable
    );

    // ---- Cierre automático ----

    /** Subastas activas cuya fecha de fin ya pasó: candidatas a cerrar. */
    @Query("SELECT s FROM Subasta s WHERE s.estado = 'ACTIVA' AND s.fechaFin <= :ahora")
    List<Subasta> findSubastasParaCerrar(@Param("ahora") LocalDateTime ahora);

    /** Subastas programadas cuya fecha de inicio llegó: candidatas a activar. */
    @Query("SELECT s FROM Subasta s WHERE s.estado = 'PROGRAMADA' AND s.fechaInicio <= :ahora")
    List<Subasta> findSubastasParaActivar(@Param("ahora") LocalDateTime ahora);

    /** Subastas que están por vencer en los próximos N minutos. */
    @Query("SELECT s FROM Subasta s WHERE s.estado = 'ACTIVA' AND s.fechaFin BETWEEN :ahora AND :limite")
    List<Subasta> findSubastasPorVencer(
            @Param("ahora") LocalDateTime ahora,
            @Param("limite") LocalDateTime limite
    );

    // ---- Bloqueo pesimista para operaciones de puja ----

    /**
     * Obtiene la subasta con bloqueo pesimista PESSIMISTIC_WRITE.
     * Usar dentro de una transacción para serializar pujas concurrentes.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Subasta s WHERE s.id = :id")
    Optional<Subasta> findByIdConBloqueo(@Param("id") Long id);

    // ---- Búsquedas por ganador ----

    /** Subastas finalizadas ganadas por un usuario. */
    List<Subasta> findByGanadorId(Long ganadorId);

    // ---- Búsquedas por categoría (a través del producto) ----

    @Query("SELECT s FROM Subasta s JOIN s.producto p WHERE p.categoria = :categoria AND s.estado = :estado")
    List<Subasta> findByCategoriayEstado(
            @Param("categoria") String categoria,
            @Param("estado") EstadoSubasta estado
    );
}
