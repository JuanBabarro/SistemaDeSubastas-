package com.sistemadesubastas.demo.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AlertaInteresResponse {
    private Long id;
    private String categoria;
    private String marca;
    private String palabrasClave;
    private BigDecimal precioMin;
    private BigDecimal precioMax;
    private boolean activa;
    private LocalDateTime fechaCreacion;
}
