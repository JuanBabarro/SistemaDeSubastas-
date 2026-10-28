package com.sistemadesubastas.demo.entity;

import com.sistemadesubastas.demo.enums.EstadoSubasta;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "subastas",
    indexes = {
        @Index(name = "idx_subasta_estado", columnList = "estado"),
        @Index(name = "idx_subasta_vendedor", columnList = "vendedor_id"),
        @Index(name = "idx_subasta_fecha_fin", columnList = "fecha_fin"),
        @Index(name = "idx_subasta_fecha_inicio", columnList = "fecha_inicio")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private Usuario vendedor;

    /** Precio inicial. Debe ser mayor que cero. */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal precioBase;

    /** Precio de la oferta más alta aceptada actualmente. */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal precioActual;

    /** Diferencia mínima entre ofertas consecutivas. */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal incrementoMinimo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaInicio;

    @Column(nullable = false)
    private LocalDateTime fechaFin;

    /** Momento efectivo en que se cerró la subasta. */
    private LocalDateTime fechaCierreReal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoSubasta estado = EstadoSubasta.BORRADOR;

    /** Usuario ganador, sólo disponible cuando la subasta finaliza correctamente. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ganador_id")
    private Usuario ganador;

    /** Puja que determinó el resultado final. */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "puja_ganadora_id")
    private Puja pujaGanadora;

    @Column(columnDefinition = "TEXT")
    private String motivoCancelacion;

    /** Oculta la subasta del historial del vendedor sin borrar el registro histórico. */
    @Column(name = "oculta_vendedor")
    @Builder.Default
    private Boolean ocultaVendedor = false;

    /**
     * Versión para control de concurrencia optimista.
     * Hibernate lanzará OptimisticLockException si dos transacciones
     * intentan modificar la misma subasta simultáneamente.
     */
    @Version
    private Long version;

    // ---- Relaciones ----

    @OneToMany(mappedBy = "subasta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Puja> pujas = new ArrayList<>();

    @OneToMany(mappedBy = "subasta", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    private List<SeguimientoSubasta> seguimientos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.precioActual == null) {
            this.precioActual = this.precioBase;
        }
    }
}
