package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.dto.request.AlertaInteresRequest;
import com.sistemadesubastas.demo.dto.response.AlertaInteresResponse;
import com.sistemadesubastas.demo.entity.AlertaInteres;
import com.sistemadesubastas.demo.entity.Usuario;
import com.sistemadesubastas.demo.exception.UsuarioNoEncontradoException;
import com.sistemadesubastas.demo.enums.CategoriaProducto;
import com.sistemadesubastas.demo.repository.AlertaInteresRepository;
import com.sistemadesubastas.demo.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AlertaInteresService {

    private final AlertaInteresRepository alertaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<AlertaInteresResponse> listar(Long usuarioId) {
        return alertaRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream().map(this::mapear).toList();
    }

    public AlertaInteresResponse crear(Long usuarioId, AlertaInteresRequest request) {
        validar(request);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNoEncontradoException(usuarioId));
        AlertaInteres alerta = AlertaInteres.builder()
                .usuario(usuario)
                .categoria(normalizarCategoria(request.getCategoria()))
                .marca(limpiar(request.getMarca()))
                .palabrasClave(limpiar(request.getPalabrasClave()))
                .precioMin(request.getPrecioMin())
                .precioMax(request.getPrecioMax())
                .activa(request.getActiva() == null || request.getActiva())
                .build();
        return mapear(alertaRepository.save(alerta));
    }

    public AlertaInteresResponse actualizar(Long usuarioId, Long alertaId, AlertaInteresRequest request) {
        validar(request);
        AlertaInteres alerta = obtenerPropia(usuarioId, alertaId);
        alerta.setCategoria(normalizarCategoria(request.getCategoria()));
        alerta.setMarca(limpiar(request.getMarca()));
        alerta.setPalabrasClave(limpiar(request.getPalabrasClave()));
        alerta.setPrecioMin(request.getPrecioMin());
        alerta.setPrecioMax(request.getPrecioMax());
        if (request.getActiva() != null) alerta.setActiva(request.getActiva());
        return mapear(alertaRepository.save(alerta));
    }

    public void eliminar(Long usuarioId, Long alertaId) {
        alertaRepository.delete(obtenerPropia(usuarioId, alertaId));
    }

    private AlertaInteres obtenerPropia(Long usuarioId, Long alertaId) {
        AlertaInteres alerta = alertaRepository.findById(alertaId)
                .orElseThrow(() -> new IllegalArgumentException("Alerta de interés no encontrada"));
        if (!alerta.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("No tienes permiso para modificar esta alerta");
        }
        return alerta;
    }

    private void validar(AlertaInteresRequest request) {
        if (limpiar(request.getCategoria()) == null) {
            throw new IllegalArgumentException("La categoría es obligatoria para crear una alerta");
        }
        if (request.getPrecioMin() != null && request.getPrecioMax() != null
                && request.getPrecioMin().compareTo(request.getPrecioMax()) > 0) {
            throw new IllegalArgumentException("El precio mínimo no puede superar al máximo");
        }
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private String normalizarCategoria(String valor) {
        return limpiar(valor) == null ? null : CategoriaProducto.normalizar(valor);
    }

    private AlertaInteresResponse mapear(AlertaInteres alerta) {
        return AlertaInteresResponse.builder()
                .id(alerta.getId())
                .categoria(alerta.getCategoria())
                .marca(alerta.getMarca())
                .palabrasClave(alerta.getPalabrasClave())
                .precioMin(alerta.getPrecioMin())
                .precioMax(alerta.getPrecioMax())
                .activa(alerta.isActiva())
                .fechaCreacion(alerta.getFechaCreacion())
                .build();
    }
}
