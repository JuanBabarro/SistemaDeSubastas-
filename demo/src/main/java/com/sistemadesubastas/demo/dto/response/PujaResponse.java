package com.sistemadesubastas.demo.dto.response;

import com.sistemadesubastas.demo.enums.EstadoPuja;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PujaResponse {

    private Long id;
    private Long subastaId;
    private Long postorId;
    private String postorUsername;
    private BigDecimal monto;
    private LocalDateTime fechaHora;
    private EstadoPuja estado;
}
