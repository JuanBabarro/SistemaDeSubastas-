package com.sistemadesubastas.demo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CrearPujaRequest {

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor que cero")
    private BigDecimal monto;

    /**
     * Identificador único generado por el cliente (UUID).
     * Permite al servidor detectar reintentos y evitar duplicar la puja.
     */
    private String identificadorSolicitud;
}
