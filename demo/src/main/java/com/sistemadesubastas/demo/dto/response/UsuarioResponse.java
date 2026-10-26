package com.sistemadesubastas.demo.dto.response;

import com.sistemadesubastas.demo.enums.RolUsuario;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UsuarioResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String username;
    private String email;
    private RolUsuario rol;
    private String fotoPerfilUrl;
    private boolean activo;
    private LocalDateTime fechaRegistro;
}
