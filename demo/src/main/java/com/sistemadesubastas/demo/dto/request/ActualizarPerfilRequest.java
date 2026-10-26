package com.sistemadesubastas.demo.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarPerfilRequest {

    @Size(max = 100)
    private String nombre;

    @Size(max = 100)
    private String apellido;

    @Email(message = "El email no tiene formato válido")
    @Size(max = 150)
    private String email;

    @Size(max = 500)
    private String fotoPerfilUrl;
}
