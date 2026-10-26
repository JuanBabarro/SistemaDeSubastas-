package com.sistemadesubastas.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "seguimientos_subasta",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_seguimiento_usuario_subasta",
            columnNames = {"usuario_id", "subasta_id"}
        )
    },
    indexes = {
        @Index(name = "idx_seguimiento_usuario", columnList = "usuario_id"),
        @Index(name = "idx_seguimiento_subasta", columnList = "subasta_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeguimientoSubasta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subasta_id", nullable = false)
    private Subasta subasta;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaSeguimiento;

    /** Si es false, el usuario sigue la subasta pero no quiere notificaciones push. */
    @Column(nullable = false)
    @Builder.Default
    private boolean notificacionesActivas = true;

    @PrePersist
    protected void onCreate() {
        this.fechaSeguimiento = LocalDateTime.now();
    }
}
