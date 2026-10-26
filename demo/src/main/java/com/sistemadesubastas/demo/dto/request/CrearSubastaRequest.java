package com.sistemadesubastas.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CrearSubastaRequest {

    // ---- Datos del producto ----
    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 200)
    private String nombreProducto;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 5000, message = "La descripción no puede superar los 5000 caracteres")
    private String descripcionProducto;

    @NotBlank(message = "La categoría es obligatoria")
    @Size(max = 100)
    private String categoriaProducto;

    @Size(max = 100)
    private String marcaProducto;

    @Size(max = 100)
    private String modeloProducto;

    // ---- Datos de la subasta ----
    @NotNull(message = "El precio base es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio base debe ser mayor que cero")
    private BigDecimal precioBase;

    @NotNull(message = "El incremento mínimo es obligatorio")
    @DecimalMin(value = "0.01", message = "El incremento mínimo debe ser mayor que cero")
    private BigDecimal incrementoMinimo;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Future(message = "La fecha de inicio debe ser futura")
    private LocalDateTime fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDateTime fechaFin;
}
