package com.sistemadesubastas.demo.repository;

import com.sistemadesubastas.demo.entity.SesionUsuario;
import com.sistemadesubastas.demo.enums.EstadoSesion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SesionUsuarioRepository extends JpaRepository<SesionUsuario, Long> {

    List<SesionUsuario> findByUsuarioIdOrderByFechaInicioDesc(Long usuarioId);

    List<SesionUsuario> findByEstado(EstadoSesion estado);

    Optional<SesionUsuario> findByIdentificadorConexion(String identificadorConexion);

    long countByEstado(EstadoSesion estado);
}
