package com.sistemadesubastas.demo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "fotos_producto",
    indexes = {
        @Index(name = "idx_foto_producto", columnList = "producto_id"),
        @Index(name = "idx_foto_principal", columnList = "producto_id, es_principal")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FotoProducto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(length = 255)
    private String nombreArchivo;

    /** Ejemplo: image/jpeg, image/png, image/webp */
    @Column(length = 50)
    private String tipoContenido;

    /** Posición en la galería. Menor número = primer lugar. */
    @Column(nullable = false)
    @Builder.Default
    private int orden = 0;

    @Column(name = "es_principal", nullable = false)
    @Builder.Default
    private boolean esPrincipal = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaSubida;

    @PrePersist
    protected void onCreate() {
        this.fechaSubida = LocalDateTime.now();
    }
}
