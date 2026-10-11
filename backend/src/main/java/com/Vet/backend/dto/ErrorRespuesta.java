package com.Vet.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

/**
 * Formato único de todos los errores de la API:
 * { "status": 400, "mensaje": "...", "errores": { "campo": "motivo" } }
 * "errores" solo aparece cuando hay problemas por campo (validaciones).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorRespuesta(int status, String mensaje, Map<String, String> errores) {
}
