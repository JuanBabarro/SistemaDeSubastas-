package com.sistemadesubastas.demo.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SeguimientoRequest {

    @NotNull(message = "El ID de subasta es obligatorio")
    private Long subastaId;

    /** Indica si el usuario quiere recibir notificaciones de esta subasta. */
    private boolean notificacionesActivas = true;
}
