package com.sistemadesubastas.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class SubastaNoActivaException extends RuntimeException {
    public SubastaNoActivaException(Long id) {
        super("La subasta con id " + id + " no está activa");
    }
    public SubastaNoActivaException(String mensaje) {
        super(mensaje);
    }
}
