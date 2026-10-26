package com.sistemadesubastas.demo.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ResultadoPujaResponse {

    private boolean aceptada;
    private BigDecimal precioActual;

    /** Monto de la oferta que superó al usuario, si corresponde. */
    private BigDecimal montoSuperado;

    private String mensaje;
    private String motivoRechazo;
}
