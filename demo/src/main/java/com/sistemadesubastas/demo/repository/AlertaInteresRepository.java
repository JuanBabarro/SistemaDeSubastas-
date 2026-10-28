package com.sistemadesubastas.demo.repository;

import com.sistemadesubastas.demo.entity.AlertaInteres;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertaInteresRepository extends JpaRepository<AlertaInteres, Long> {

    List<AlertaInteres> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);

    @Query("SELECT a FROM AlertaInteres a WHERE a.activa = true " +
            "AND a.usuario.activo = true " +
            "AND LOWER(TRIM(a.categoria)) = LOWER(TRIM(:categoria))")
    List<AlertaInteres> findAlertasActivasPorCategoria(@Param("categoria") String categoria);
}
