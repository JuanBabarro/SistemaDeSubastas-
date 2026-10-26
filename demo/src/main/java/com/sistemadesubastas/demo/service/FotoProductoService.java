package com.sistemadesubastas.demo.service;

import com.sistemadesubastas.demo.dto.request.ActualizarOrdenFotosRequest;
import com.sistemadesubastas.demo.dto.response.FotoProductoResponse;
import com.sistemadesubastas.demo.entity.FotoProducto;
import com.sistemadesubastas.demo.entity.Producto;
import com.sistemadesubastas.demo.exception.ErrorAlmacenarImagenException;
import com.sistemadesubastas.demo.exception.PermisoDenegadoException;
import com.sistemadesubastas.demo.repository.FotoProductoRepository;
import com.sistemadesubastas.demo.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class FotoProductoService {

    private final FotoProductoRepository fotoRepository;
    private final ProductoRepository productoRepository;

    @Value("${app.storage.upload-dir:uploads/fotos}")
    private String uploadDir;

    private static final Set<String> TIPOS_PERMITIDOS = Set.of("image/jpeg", "image/png", "image/webp");
    private static final long TAMANIO_MAXIMO_BYTES = 5 * 1024 * 1024; // 5 MB
    private static final int MAX_FOTOS_POR_PRODUCTO = 10;

    public FotoProductoResponse subirFoto(Long productoId, MultipartFile archivo, Long usuarioId) {
        Producto producto = obtenerProductoConPermiso(productoId, usuarioId);
        validarArchivo(archivo);

        long cantidadActual = fotoRepository.findByProductoIdOrderByOrdenAsc(productoId).size();
        if (cantidadActual >= MAX_FOTOS_POR_PRODUCTO) {
            throw new IllegalArgumentException("El producto ya tiene el máximo de " + MAX_FOTOS_POR_PRODUCTO + " fotos");
        }

        String extension = switch (archivo.getContentType()) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException("Formato no permitido. Use JPEG, PNG o WebP");
        };
        String nombreGenerado = UUID.randomUUID() + extension;
        Path rutaDestino = Paths.get(uploadDir).resolve(nombreGenerado);

        try {
            Files.createDirectories(rutaDestino.getParent());
            Files.copy(archivo.getInputStream(), rutaDestino, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ErrorAlmacenarImagenException("Error al guardar la imagen", e);
        }

        boolean esPrimera = cantidadActual == 0;
        FotoProducto foto = FotoProducto.builder()
                .producto(producto)
                .url("/uploads/fotos/" + nombreGenerado)
                .nombreArchivo(nombreSeguro(archivo.getOriginalFilename()))
                .tipoContenido(archivo.getContentType())
                .orden((int) cantidadActual)
                .esPrincipal(esPrimera)
                .build();

        foto = fotoRepository.save(foto);
        return mapear(foto);
    }

    public void eliminarFoto(Long productoId, Long fotoId, Long usuarioId) {
        obtenerProductoConPermiso(productoId, usuarioId);
        FotoProducto foto = fotoRepository.findByProductoIdAndId(productoId, fotoId)
                .orElseThrow(() -> new IllegalArgumentException("La foto no pertenece a este producto"));
        Path directorio = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path archivo = directorio.resolve(Paths.get(foto.getUrl()).getFileName()).normalize();
        if (archivo.startsWith(directorio)) {
            try {
                Files.deleteIfExists(archivo);
            } catch (IOException e) {
                throw new ErrorAlmacenarImagenException("No se pudo eliminar el archivo de imagen", e);
            }
        }
        fotoRepository.delete(foto);

        List<FotoProducto> restantes = new ArrayList<>(fotoRepository.findByProductoIdOrderByOrdenAsc(productoId));
        for (int i = 0; i < restantes.size(); i++) {
            restantes.get(i).setOrden(i);
            restantes.get(i).setEsPrincipal(i == 0);
        }
        fotoRepository.saveAll(restantes);
    }

    public void actualizarOrden(Long productoId, ActualizarOrdenFotosRequest request, Long usuarioId) {
        obtenerProductoConPermiso(productoId, usuarioId);
        List<FotoProducto> fotos = fotoRepository.findByProductoIdOrderByOrdenAsc(productoId);
        List<Long> idsOrdenados = request.getFotosIds();

        Set<Long> idsActuales = fotos.stream().map(FotoProducto::getId).collect(java.util.stream.Collectors.toSet());
        if (idsOrdenados.size() != fotos.size()
                || idsOrdenados.stream().distinct().count() != idsOrdenados.size()
                || !idsActuales.equals(Set.copyOf(idsOrdenados))) {
            throw new IllegalArgumentException("El orden debe incluir cada foto del producto exactamente una vez");
        }

        for (int i = 0; i < idsOrdenados.size(); i++) {
            final int orden = i;
            final Long fotoId = idsOrdenados.get(i);
            fotos.stream().filter(f -> f.getId().equals(fotoId)).findFirst().ifPresent(f -> {
                f.setOrden(orden);
                f.setEsPrincipal(orden == 0);
            });
        }
        fotoRepository.saveAll(fotos);
    }

    @Transactional(readOnly = true)
    public List<FotoProductoResponse> listarFotos(Long productoId) {
        return fotoRepository.findByProductoIdOrderByOrdenAsc(productoId).stream()
                .map(this::mapear).toList();
    }

    // ---- Helpers ----

    private Producto obtenerProductoConPermiso(Long productoId, Long usuarioId) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + productoId));
        if (!producto.getVendedor().getId().equals(usuarioId)) {
            throw new PermisoDenegadoException("No tiene permiso para modificar las fotos de este producto");
        }
        return producto;
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo.isEmpty()) {
            throw new IllegalArgumentException("El archivo está vacío");
        }
        if (!TIPOS_PERMITIDOS.contains(archivo.getContentType())) {
            throw new IllegalArgumentException("Formato no permitido. Use JPEG, PNG o WebP");
        }
        if (archivo.getSize() > TAMANIO_MAXIMO_BYTES) {
            throw new IllegalArgumentException("El archivo supera el tamaño máximo de 5 MB");
        }
    }

    private String nombreSeguro(String nombreOriginal) {
        if (nombreOriginal == null || nombreOriginal.isBlank()) return "imagen";
        String nombre = Paths.get(nombreOriginal).getFileName().toString();
        return nombre.length() > 255 ? nombre.substring(nombre.length() - 255) : nombre;
    }

    private FotoProductoResponse mapear(FotoProducto f) {
        return FotoProductoResponse.builder()
                .id(f.getId()).url(f.getUrl())
                .nombreArchivo(f.getNombreArchivo())
                .tipoContenido(f.getTipoContenido())
                .orden(f.getOrden()).esPrincipal(f.isEsPrincipal())
                .fechaSubida(f.getFechaSubida()).build();
    }
}
