package com.sistemadesubastas.demo.repository;

import com.sistemadesubastas.demo.entity.FotoProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FotoProductoRepository extends JpaRepository<FotoProducto, Long> {

    List<FotoProducto> findByProductoIdOrderByOrdenAsc(Long productoId);

    Optional<FotoProducto> findByProductoIdAndEsPrincipalTrue(Long productoId);

    Optional<FotoProducto> findByProductoIdAndId(Long productoId, Long id);

    void deleteByProductoIdAndId(Long productoId, Long fotoId);
}
