package com.sistemadesubastas.demo.entity;

import com.sistemadesubastas.demo.enums.RolUsuario;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "usuarios",
    indexes = {
        @Index(name = "idx_usuario_username", columnList = "username"),
        @Index(name = "idx_usuario_email", columnList = "email"),
        @Index(name = "idx_usuario_rol", columnList = "rol")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /**
     * Contraseña almacenada como hash seguro (bcrypt). Nunca en texto plano.
     */
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RolUsuario rol;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;

    /**
     * Controla si el usuario puede autenticarse y realizar operaciones protegidas.
     */
    @Column(nullable = false)
    private boolean activo;

    private LocalDateTime fechaUltimaConexion;

    @Column(length = 500)
    private String fotoPerfilUrl;

    // ---- Relaciones ----

    @OneToMany(mappedBy = "vendedor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Subasta> subastasPublicadas = new ArrayList<>();

    @OneToMany(mappedBy = "postor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Puja> pujas = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<SeguimientoSubasta> seguimientos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
        this.activo = true;
    }
}
