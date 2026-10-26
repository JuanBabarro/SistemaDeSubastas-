package com.sistemadesubastas.demo.tcp;

/**
 * Constantes del protocolo de comandos TCP.
 *
 * Formato de los mensajes (texto plano, una línea por mensaje):
 *   COMANDO|param1|param2|...
 *
 * Ejemplos:
 *   LOGIN|usuario|contraseña
 *   PUJAR|subastaId|monto|idSolicitud
 *   LISTAR_SUBASTAS
 *   LOGOUT
 */
public final class ProtocoloTCP {

    private ProtocoloTCP() {}

    // ─── Comandos del cliente → servidor ─────────────────────────────────────
    public static final String CMD_LOGIN           = "LOGIN";
    public static final String CMD_PUJAR           = "PUJAR";
    public static final String CMD_LISTAR_SUBASTAS = "LISTAR_SUBASTAS";
    public static final String CMD_VER_SUBASTA     = "VER_SUBASTA";
    public static final String CMD_LOGOUT          = "LOGOUT";
    public static final String CMD_PING            = "PING";

    // ─── Respuestas del servidor → cliente ───────────────────────────────────
    public static final String RESP_OK             = "OK";
    public static final String RESP_ERROR          = "ERROR";
    public static final String RESP_PUJA_ACEPTADA  = "PUJA_ACEPTADA";
    public static final String RESP_PUJA_RECHAZADA = "PUJA_RECHAZADA";
    public static final String RESP_SUBASTA_CERRADA = "SUBASTA_CERRADA";
    public static final String RESP_PONG           = "PONG";

    // ─── Separador de campos ─────────────────────────────────────────────────
    public static final String SEP = "|";
    public static final String SEP_REGEX = "\\|";
}
