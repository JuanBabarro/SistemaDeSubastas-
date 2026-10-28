package com.sistemadesubastas.demo.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AlertaInteresRequest {

    @NotBlank(message = "La categoría es obligatoria")
    @Size(max = 100)
    private String categoria;

    @Size(max = 100)
    private String marca;

    @Size(max = 120)
    private String palabrasClave;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal precioMin;

    @DecimalMin(value = "0.0", inclusive = true)
    private BigDecimal precioMax;

    private Boolean activa;
}
