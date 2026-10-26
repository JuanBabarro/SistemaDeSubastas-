package com.sistemadesubastas.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "eventos_subasta",
    indexes = {
        @Index(name = "idx_evento_subasta", columnList = "subasta_id"),
        @Index(name = "idx_evento_tipo", columnList = "tipo_evento"),
        @Index(name = "idx_evento_operacion", columnList = "identificador_operacion")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventoSubasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subasta_id", nullable = false)
    private Subasta subasta;

    @Column(nullable = false, length = 80)
    private String tipoEvento;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaHora;

    /** JSON u otro formato con datos adicionales del evento. */
    @Column(columnDefinition = "TEXT")
    private String datos;

    /**
     * Identificador único de la operación que generó el evento.
     * Permite correlacionar eventos y detectar duplicados.
     */
    @Column(name = "identificador_operacion", length = 100)
    private String identificadorOperacion;

    @PrePersist
    protected void onCreate() {
        this.fechaHora = LocalDateTime.now();
    }
}
