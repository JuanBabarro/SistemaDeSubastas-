package com.sistemadesubastas.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ErrorAlmacenarImagenException extends RuntimeException {
    public ErrorAlmacenarImagenException(String mensaje) {
        super(mensaje);
    }
    public ErrorAlmacenarImagenException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}
