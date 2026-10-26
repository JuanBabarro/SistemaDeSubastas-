package com.sistemadesubastas.demo.dto.response;

import com.sistemadesubastas.demo.enums.TipoNotificacion;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificacionResponse {

    private Long id;
    private TipoNotificacion tipo;
    private String titulo;
    private String mensaje;
    private LocalDateTime fechaCreacion;
    private boolean leida;
    private LocalDateTime fechaLectura;
    private Long subastaId;
}
