package com.sistemadesubastas.demo.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record NuevaPujaRegistradaEvent(
        Long subastaId,
        BigDecimal precioActual,
        String postorUsername,
        BigDecimal monto,
        LocalDateTime fechaHora) {
}
