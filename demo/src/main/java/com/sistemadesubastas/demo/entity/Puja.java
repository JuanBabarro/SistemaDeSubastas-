package com.sistemadesubastas.demo.entity;

import com.sistemadesubastas.demo.enums.EstadoPuja;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "pujas",
    indexes = {
        @Index(name = "idx_puja_subasta", columnList = "subasta_id"),
        @Index(name = "idx_puja_postor", columnList = "postor_id"),
        @Index(name = "idx_puja_subasta_fecha", columnList = "subasta_id, fecha_hora"),
        @Index(name = "idx_puja_solicitud", columnList = "identificador_solicitud")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Puja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subasta_id", nullable = false)
    private Subasta subasta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "postor_id", nullable = false)
    private Usuario postor;

    /** Importe ofrecido. Debe ser positivo y superar precioActual + incrementoMinimo. */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal monto;

    /** Momento exacto en que la puja fue recibida y aceptada. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private EstadoPuja estado = EstadoPuja.ACEPTADA;

    /**
     * UUID único enviado por el cliente para evitar duplicar la puja
     * en caso de reintentos de red (idempotencia).
     */
    @Column(name = "identificador_solicitud", unique = true, length = 100)
    private String identificadorSolicitud;

    @PrePersist
    protected void onCreate() {
        this.fechaHora = LocalDateTime.now();
    }
}
