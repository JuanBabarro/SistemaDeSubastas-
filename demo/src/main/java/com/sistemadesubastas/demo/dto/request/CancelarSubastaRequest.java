package com.sistemadesubastas.demo.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CancelarSubastaRequest {

    @Size(max = 1000, message = "El motivo no puede superar los 1000 caracteres")
    private String motivo;
}
