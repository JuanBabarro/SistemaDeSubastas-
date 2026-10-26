package com.sistemadesubastas.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CancelacionNoPermitidaException extends RuntimeException {
    public CancelacionNoPermitidaException(String mensaje) {
        super(mensaje);
    }
}
