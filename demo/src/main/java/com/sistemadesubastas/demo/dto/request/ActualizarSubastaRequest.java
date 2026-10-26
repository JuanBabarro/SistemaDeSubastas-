package com.sistemadesubastas.demo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ActualizarSubastaRequest {

    /**
     * Solo se aceptan campos editables antes del inicio de la subasta.
     * No se permite modificar: estado, ganador, precioActual ni pujaGanadora.
     */
    @DecimalMin(value = "0.01", message = "El incremento mínimo debe ser mayor que cero")
    private BigDecimal incrementoMinimo;

    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    // Datos del producto editables
    @Size(max = 200)
    private String nombreProducto;

    @Size(max = 5000)
    private String descripcionProducto;

    @Size(max = 100)
    private String categoriaProducto;

    @Size(max = 100)
    private String marcaProducto;

    @Size(max = 100)
    private String modeloProducto;
}
