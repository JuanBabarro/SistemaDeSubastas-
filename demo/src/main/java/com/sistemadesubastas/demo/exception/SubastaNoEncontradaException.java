package com.sistemadesubastas.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class SubastaNoEncontradaException extends RuntimeException {
    public SubastaNoEncontradaException(Long id) {
        super("Subasta no encontrada con id: " + id);
    }
    public SubastaNoEncontradaException(String mensaje) {
        super(mensaje);
    }
}
