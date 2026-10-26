package com.sistemadesubastas.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SubastaYaFinalizadaException extends RuntimeException {
    public SubastaYaFinalizadaException(Long id) {
        super("La subasta con id " + id + " ya está finalizada o cerrada");
    }
    public SubastaYaFinalizadaException(String mensaje) {
        super(mensaje);
    }
}
