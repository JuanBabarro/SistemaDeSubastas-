package com.sistemadesubastas.demo.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ActualizarOrdenFotosRequest {

    /**
     * Lista de IDs de fotografías en el orden deseado.
     * El índice 0 será orden=0 (primero), índice 1 será orden=1, etc.
     */
    @NotNull
    @NotEmpty(message = "Debe indicar al menos una fotografía")
    private List<Long> fotosIds;
}
