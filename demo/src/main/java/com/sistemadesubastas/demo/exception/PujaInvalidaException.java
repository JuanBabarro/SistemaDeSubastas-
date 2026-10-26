package com.sistemadesubastas.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class PujaInvalidaException extends RuntimeException {
    public PujaInvalidaException(String mensaje) {
        super(mensaje);
    }
}
