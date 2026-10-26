package com.sistemadesubastas.demo.repository;

import com.sistemadesubastas.demo.entity.Producto;
import com.sistemadesubastas.demo.enums.EstadoProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    List<Producto> findByEstado(EstadoProducto estado);

    List<Producto> findByVendedorId(Long vendedorId);

    List<Producto> findByVendedorIdAndEstado(Long vendedorId, EstadoProducto estado);
}
