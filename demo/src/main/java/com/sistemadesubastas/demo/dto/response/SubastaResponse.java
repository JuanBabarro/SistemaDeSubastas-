package com.sistemadesubastas.demo.dto.response;

import com.sistemadesubastas.demo.enums.EstadoSubasta;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SubastaResponse {

    private Long id;

    // Información del producto
    private Long productoId;
    private String nombreProducto;
    private String descripcionProducto;
    private String categoriaProducto;
    private String marcaProducto;
    private String modeloProducto;
    private List<FotoProductoResponse> fotos;

    // Información del vendedor
    private Long vendedorId;
    private String vendedorUsername;

    // Precios
    private BigDecimal precioBase;
    private BigDecimal precioActual;
    private BigDecimal incrementoMinimo;

    // Fechas
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;

    /** Segundos restantes calculados dinámicamente. */
    private Long segundosRestantes;

    // Estado
    private EstadoSubasta estado;

    private long cantidadPujas;

    /** Solo se expone cuando la subasta finaliza. */
    private UsuarioResponse ganador;
}
