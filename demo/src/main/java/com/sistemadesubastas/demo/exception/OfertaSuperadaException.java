package com.sistemadesubastas.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class OfertaSuperadaException extends RuntimeException {
    public OfertaSuperadaException(String mensaje) {
        super(mensaje);
    }
}
