package com.sistemadesubastas.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Manejador global de excepciones. Transforma las excepciones del negocio
 * en respuestas HTTP consistentes sin exponer trazas internas ni datos sensibles.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---- 400 Bad Request ----

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = ((FieldError) error).getField();
            errores.put(campo, error.getDefaultMessage());
        });
        return ResponseEntity.badRequest().body(buildError(400, "Datos de entrada inválidos", errores));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(buildError(400, ex.getMessage(), null));
    }

    // ---- 401 Unauthorized ----

    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<Map<String, Object>> handleCredencialesInvalidas(CredencialesInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(buildError(401, ex.getMessage(), null));
    }

    // ---- 403 Forbidden ----

    @ExceptionHandler(PermisoDenegadoException.class)
    public ResponseEntity<Map<String, Object>> handlePermisoDenegado(PermisoDenegadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(403, ex.getMessage(), null));
    }

    // ---- 404 Not Found ----

    @ExceptionHandler({UsuarioNoEncontradoException.class, SubastaNoEncontradaException.class})
    public ResponseEntity<Map<String, Object>> handleNoEncontrado(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(404, ex.getMessage(), null));
    }

    // ---- 409 Conflict ----

    @ExceptionHandler({
        UsuarioDuplicadoException.class,
        SubastaNoActivaException.class,
        SubastaYaFinalizadaException.class,
        CancelacionNoPermitidaException.class,
        PujaInvalidaException.class,
        OfertaSuperadaException.class
    })
    public ResponseEntity<Map<String, Object>> handleConflicto(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(409, ex.getMessage(), null));
    }

    // ---- 500 Internal Server Error ----

    @ExceptionHandler(ErrorAlmacenarImagenException.class)
    public ResponseEntity<Map<String, Object>> handleErrorAlmacenamiento(ErrorAlmacenarImagenException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(500, "Error al procesar la imagen", null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        // No exponer el detalle interno al cliente
        log.error("Error interno procesando una solicitud", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(500, "Error interno del servidor", null));
    }

    // ---- Utilidad ----

    private Map<String, Object> buildError(int status, String mensaje, Object detalle) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status);
        body.put("mensaje", mensaje);
        if (detalle != null) {
            body.put("errores", detalle);
        }
        return body;
    }
}
