package com.sistemadesubastas.demo.dto.response;

import com.sistemadesubastas.demo.enums.EstadoSubasta;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ResultadoSubastaResponse {

    private Long subastaId;
    private EstadoSubasta estadoFinal;
    private UsuarioResponse ganador;
    private BigDecimal montoGanador;
    private LocalDateTime fechaCierre;
    private boolean desierta;
    private String motivoCancelacion;
}
