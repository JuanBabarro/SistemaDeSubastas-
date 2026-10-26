package com.sistemadesubastas.demo.repository;

import com.sistemadesubastas.demo.entity.EventoSubasta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventoSubastaRepository extends JpaRepository<EventoSubasta, Long> {

    List<EventoSubasta> findBySubastaIdOrderByFechaHoraAsc(Long subastaId);

    List<EventoSubasta> findBySubastaIdAndTipoEvento(Long subastaId, String tipoEvento);

    Optional<EventoSubasta> findByIdentificadorOperacion(String identificadorOperacion);

    boolean existsByIdentificadorOperacion(String identificadorOperacion);
}
