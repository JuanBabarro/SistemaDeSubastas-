package com.sistemadesubastas.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "alertas_interes", indexes = {
        @Index(name = "idx_alerta_interes_usuario", columnList = "usuario_id, activa")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertaInteres {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(length = 100)
    private String categoria;

    @Column(length = 100)
    private String marca;

    @Column(name = "palabras_clave", length = 120)
    private String palabrasClave;

    @Column(name = "precio_min", precision = 14, scale = 2)
    private BigDecimal precioMin;

    @Column(name = "precio_max", precision = 14, scale = 2)
    private BigDecimal precioMax;

    @Column(nullable = false)
    @Builder.Default
    private boolean activa = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
    }
}
