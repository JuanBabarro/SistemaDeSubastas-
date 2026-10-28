package com.sistemadesubastas.demo.enums;

import java.util.Arrays;

public enum CategoriaProducto {
    ARTE("Arte"),
    AUTOMOTORES("Automotores"),
    COLECCIONABLES("Coleccionables"),
    ELECTRONICA("Electrónica"),
    HOGAR("Hogar"),
    INDUMENTARIA("Indumentaria"),
    INMUEBLES("Inmuebles"),
    JOYERIA("Joyería"),
    LIBROS("Libros"),
    MUEBLES("Muebles"),
    MUSICA("Música"),
    TECNOLOGIA("Tecnología"),
    OTRO("Otro");

    private final String etiqueta;

    CategoriaProducto(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    public static String normalizar(String valor) {
        if (valor == null) return null;
        String entrada = valor.trim();
        return Arrays.stream(values())
                .filter(categoria -> categoria.etiqueta.equalsIgnoreCase(entrada))
                .map(CategoriaProducto::getEtiqueta)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("La categoría seleccionada no es válida"));
    }
}
