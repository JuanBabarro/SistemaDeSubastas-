package com.sistemadesubastas.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Expone el directorio de uploads como recurso estático accesible en /uploads/**
 * para que el frontend pueda cargar las imágenes de productos directamente.
 *
 * En producción, este directorio debería ser servido por Nginx o reemplazado por S3.
 */
@Configuration
public class StorageConfig implements WebMvcConfigurer {

    @Value("${app.storage.upload-dir:uploads/fotos}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().toUri().toString();
        registry.addResourceHandler("/uploads/fotos/**")
                .addResourceLocations(absolutePath);
    }
}
