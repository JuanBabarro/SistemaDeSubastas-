package com.sistemadesubastas.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "auditoria",
    indexes = {
        @Index(name = "idx_auditoria_usuario", columnList = "usuario_id"),
        @Index(name = "idx_auditoria_entidad", columnList = "entidad_afectada, identificador_entidad"),
        @Index(name = "idx_auditoria_fecha", columnList = "fecha_hora")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auditoria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Usuario que realizó la acción. Puede ser null en acciones del sistema. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false, length = 100)
    private String tipoAccion;

    @Column(name = "entidad_afectada", length = 100)
    private String entidadAfectada;

    @Column(name = "identificador_entidad")
    private Long identificadorEntidad;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaHora;

    /** Detalle adicional de la acción (motivos, contexto, etc.). Nunca datos sensibles. */
    @Column(columnDefinition = "TEXT")
    private String detalle;

    /** EXITO, ERROR, PARCIAL, etc. */
    @Column(length = 50)
    private String resultado;

    @PrePersist
    protected void onCreate() {
        this.fechaHora = LocalDateTime.now();
    }
}
