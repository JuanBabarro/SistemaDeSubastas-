package com.sistemadesubastas.demo.repository;

import com.sistemadesubastas.demo.entity.Puja;
import com.sistemadesubastas.demo.enums.EstadoPuja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PujaRepository extends JpaRepository<Puja, Long> {

    List<Puja> findBySubastaIdOrderByFechaHoraAsc(Long subastaId);

    List<Puja> findBySubastaIdAndEstadoOrderByFechaHoraAsc(Long subastaId, EstadoPuja estado);

    List<Puja> findByPostorIdOrderByFechaHoraDesc(Long postorId);

    /** Última puja aceptada de una subasta (la ganadora momentánea). */
    Optional<Puja> findFirstBySubastaIdAndEstadoOrderByFechaHoraDesc(Long subastaId, EstadoPuja estado);

    long countBySubastaId(Long subastaId);

    long countBySubastaIdAndEstado(Long subastaId, EstadoPuja estado);

    /** Evita procesar la misma solicitud dos veces (idempotencia). */
    Optional<Puja> findByIdentificadorSolicitud(String identificadorSolicitud);

    boolean existsByIdentificadorSolicitud(String identificadorSolicitud);

    /** Estadísticas: cantidad de pujas aceptadas por subasta. */
    @Query("SELECT p.subasta.id, COUNT(p) FROM Puja p " +
           "WHERE p.estado = 'ACEPTADA' GROUP BY p.subasta.id " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> contarPujasPorSubasta();

    /** Estadísticas: ranking de postores por cantidad de pujas aceptadas. */
    @Query("SELECT p.postor.id, COUNT(p) FROM Puja p " +
           "WHERE p.estado = 'ACEPTADA' GROUP BY p.postor.id " +
           "ORDER BY COUNT(p) DESC")
    List<Object[]> rankingPostores();

    @Query("SELECT p FROM Puja p WHERE p.subasta.id = :subastaId " +
           "AND p.estado = 'ACEPTADA' ORDER BY p.monto DESC LIMIT 1")
    Optional<Puja> findPujaGanadora(@Param("subastaId") Long subastaId);
}
