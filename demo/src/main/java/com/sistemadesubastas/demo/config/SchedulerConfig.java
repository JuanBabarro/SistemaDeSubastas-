package com.sistemadesubastas.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Habilita el scheduler de Spring para el cierre automático
 * de subastas y la activación de subastas programadas.
 */
@Configuration
@EnableScheduling
public class SchedulerConfig {
    // Solo necesita la anotación; los métodos @Scheduled viven en SubastaScheduler
}
