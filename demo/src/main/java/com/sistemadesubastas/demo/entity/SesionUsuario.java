package com.sistemadesubastas.demo.entity;

import com.sistemadesubastas.demo.enums.EstadoSesion;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "sesiones_usuario",
    indexes = {
        @Index(name = "idx_sesion_usuario", columnList = "usuario_id"),
        @Index(name = "idx_sesion_estado", columnList = "estado"),
        @Index(name = "idx_sesion_conexion", columnList = "identificador_conexion")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SesionUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaInicio;

    private LocalDateTime fechaFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoSesion estado = EstadoSesion.CONECTADA;

    /** Identificador de la conexión TCP para monitoreo. */
    @Column(name = "identificador_conexion", length = 100)
    private String identificadorConexion;

    private LocalDateTime ultimaActividad;

    @PrePersist
    protected void onCreate() {
        this.fechaInicio = LocalDateTime.now();
        this.ultimaActividad = LocalDateTime.now();
    }
}
