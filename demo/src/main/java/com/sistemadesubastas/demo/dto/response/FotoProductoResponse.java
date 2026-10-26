package com.sistemadesubastas.demo.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class FotoProductoResponse {

    private Long id;
    private String url;
    private String nombreArchivo;
    private String tipoContenido;
    private int orden;
    private boolean esPrincipal;
    private LocalDateTime fechaSubida;
}
