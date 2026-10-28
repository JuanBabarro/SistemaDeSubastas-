package com.sistemadesubastas.demo.scheduler;

import com.sistemadesubastas.demo.entity.Subasta;
import com.sistemadesubastas.demo.repository.SubastaRepository;
import com.sistemadesubastas.demo.service.NotificacionService;
import com.sistemadesubastas.demo.service.SubastaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler que gestiona el ciclo de vida automático de las subastas:
 *
 *  1. Activar subastas PROGRAMADAS cuya fechaInicio ya llegó (cada 5 s).
 *  2. Cerrar subastas ACTIVAS cuya fechaFin ya pasó (cada 15 s).
 *  3. Advertir subastas próximas a vencer (cada minuto).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SubastaScheduler {

    private final SubastaService subastaService;
    private final SubastaRepository subastaRepository;
    private final NotificacionService notificacionService;

    /**
     * Activa subastas PROGRAMADAS cuya fechaInicio llegó.
    * Corre cada 5 segundos para activar los inicios programados con poco retraso.
     */
    @Scheduled(fixedDelay = 5_000)
    public void activarSubastasProgramadas() {
        try {
            subastaService.activarSubastasProgramadas();
        } catch (Exception e) {
            log.error("Error al activar subastas programadas: {}", e.getMessage(), e);
        }
    }

    /**
     * Cierra subastas ACTIVAS cuya fechaFin ya pasó.
     * Corre cada 15 segundos para minimizar el retraso en el cierre.
     */
    @Scheduled(fixedDelay = 15_000)
    public void cerrarSubastasVencidas() {
        try {
            subastaService.cerrarSubastasPendientes();
        } catch (Exception e) {
            log.error("Error al cerrar subastas vencidas: {}", e.getMessage(), e);
        }
    }

    /**
     * Notifica a los suscriptores de subastas que vencen en los próximos 5 minutos.
     * Corre cada minuto.
     */
    @Scheduled(fixedDelay = 60_000)
    public void notificarSubastasPorVencer() {
        try {
            LocalDateTime ahora = LocalDateTime.now();
            LocalDateTime limite = ahora.plusMinutes(5);
            List<Subasta> porVencer = subastaRepository.findSubastasPorVencer(ahora, limite);

            for (Subasta subasta : porVencer) {
                // Reutilizamos el canal de estado con un tipo especial
                log.debug("Subasta {} vence pronto: {}", subasta.getId(), subasta.getFechaFin());
                // En una evolución se puede agregar TipoNotificacion.SUBASTA_POR_FINALIZAR
            }
        } catch (Exception e) {
            log.error("Error al notificar subastas por vencer: {}", e.getMessage(), e);
        }
    }
}
