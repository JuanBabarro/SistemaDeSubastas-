package com.sistemadesubastas.demo.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class EstadisticasAdminResponse {

    private long totalUsuarios;
    private long usuariosActivos;
    private long usuariosConectados;
    private long subastasActivas;
    private long subastasFinalizadas;
    private long subastasCanceladas;
    private long totalPujas;

    /** Ranking: [usuarioId, username, cantidadVictorias] */
    private List<Map<String, Object>> rankingGanadores;

    /** Productos más disputados: [subastaId, nombreProducto, cantidadPujas] */
    private List<Map<String, Object>> productosMasDisputados;
}
