package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.dto.request.CancelarSubastaRequest;
import com.sistemadesubastas.demo.dto.response.EstadisticasAdminResponse;
import com.sistemadesubastas.demo.dto.response.SubastaResponse;
import com.sistemadesubastas.demo.dto.response.UsuarioResponse;
import com.sistemadesubastas.demo.enums.EstadoSesion;
import com.sistemadesubastas.demo.enums.EstadoSubasta;
import com.sistemadesubastas.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final SubastaRepository subastaRepository;
    private final PujaRepository pujaRepository;
    private final SesionUsuarioRepository sesionRepository;
    private final SubastaService subastaService;
    private final AuditoriaService auditoriaService;
    private final UsuarioService usuarioService;

    @Transactional(readOnly = true)
    public EstadisticasAdminResponse obtenerEstadisticas() {
        long totalUsuarios = usuarioRepository.count();
        long usuariosActivos = usuarioRepository.findByActivoTrue().size();
        long usuariosConectados = sesionRepository.countByEstado(EstadoSesion.CONECTADA);
        long subastasActivas = subastaRepository.findByEstado(EstadoSubasta.ACTIVA).size();
        long subastasFinalizadas = subastaRepository.findByEstado(EstadoSubasta.FINALIZADA).size();
        long subastasCanceladas = subastaRepository.findByEstado(EstadoSubasta.CANCELADA).size();
        long totalPujas = pujaRepository.count();

        // Ranking de ganadores
        List<Map<String, Object>> rankingGanadores = new ArrayList<>();
        subastaRepository.findByEstado(EstadoSubasta.FINALIZADA).stream()
                .filter(s -> s.getGanador() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        s -> s.getGanador().getId(),
                        java.util.stream.Collectors.counting()))
                .forEach((usuarioId, victorias) -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("usuarioId", usuarioId);
                    entry.put("victorias", victorias);
                    rankingGanadores.add(entry);
                });
        rankingGanadores.sort((a, b) -> Long.compare((Long) b.get("victorias"), (Long) a.get("victorias")));

        // Productos más disputados
        List<Map<String, Object>> masDisputados = new ArrayList<>();
        pujaRepository.contarPujasPorSubasta().forEach(row -> {
            Map<String, Object> entry = new HashMap<>();
            entry.put("subastaId", row[0]);
            entry.put("cantidadPujas", row[1]);
            masDisputados.add(entry);
        });

        return EstadisticasAdminResponse.builder()
                .totalUsuarios(totalUsuarios)
                .usuariosActivos(usuariosActivos)
                .usuariosConectados(usuariosConectados)
                .subastasActivas(subastasActivas)
                .subastasFinalizadas(subastasFinalizadas)
                .subastasCanceladas(subastasCanceladas)
                .totalPujas(totalPujas)
                .rankingGanadores(rankingGanadores)
                .productosMasDisputados(masDisputados)
                .build();
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioService.listarTodos();
    }

    public void cambiarEstadoCuenta(Long usuarioId, boolean activo, Long adminId) {
        usuarioService.cambiarEstadoCuenta(usuarioId, activo);
        auditoriaService.registrar(adminId, activo ? "ACTIVAR_CUENTA" : "SUSPENDER_CUENTA",
                "Usuario", usuarioId, "Admin " + adminId + " cambió estado de cuenta a " + activo, "EXITO");
    }

    public void cancelarSubastaAdmin(Long subastaId, CancelarSubastaRequest request, Long adminId) {
        subastaService.cancelarSubasta(subastaId, request, adminId, true);
        auditoriaService.registrar(adminId, "CANCELACION_ADMIN", "Subasta", subastaId,
                "Motivo: " + request.getMotivo(), "EXITO");
    }

    @Transactional(readOnly = true)
    public List<SubastaResponse> listarSubastasActivas() {
        return subastaRepository.findByEstado(EstadoSubasta.ACTIVA)
                .stream().map(subastaService::mapearSubastaResponse).toList();
    }
}
