package com.Vet.backend.exception;

import com.Vet.backend.dto.ErrorRespuesta;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;

/** Convierte cualquier error de los controladores en una respuesta JSON clara y uniforme. */
@RestControllerAdvice
public class ManejadorErrores {

    private static final Logger log = LoggerFactory.getLogger(ManejadorErrores.class);

    // Datos que no cumplen las validaciones (@Valid en los controladores).
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorRespuesta> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errores.putIfAbsent(error.getField(), error.getDefaultMessage());
        }
        return construir(400, "Hay datos inválidos: " + String.join(" ", errores.values()), errores);
    }

    // JSON mal formado, fechas con formato incorrecto, números donde va texto, etc.
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorRespuesta> manejarCuerpoIlegible(HttpMessageNotReadableException ex) {
        return construir(400, "Los datos enviados no tienen un formato válido (revisa fechas y números).", null);
    }

    // Por ejemplo /api/duenos/abc en vez de un número.
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorRespuesta> manejarParametroInvalido(MethodArgumentTypeMismatchException ex) {
        return construir(400, "Un parámetro de la dirección no es válido.", null);
    }

    // Borrar algo que está en uso, duplicados, referencias a registros que no existen.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorRespuesta> manejarIntegridad(DataIntegrityViolationException ex) {
        return construir(409,
                "No se pudo completar la operación: el registro está en uso por otros datos, "
                        + "duplica uno existente o hace referencia a algo que no existe.",
                null);
    }

    // Errores que lanzamos nosotros: throw new ResponseStatusException(HttpStatus.CONFLICT, "motivo")
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorRespuesta> manejarEstado(ResponseStatusException ex) {
        int status = ex.getStatusCode().value();
        String mensaje = ex.getReason() != null ? ex.getReason() : mensajeGenerico(status);
        return construir(status, mensaje, null);
    }

    // Todo lo demás. Nunca se devuelve el detalle técnico al cliente; solo queda en el log del servidor.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRespuesta> manejarOtros(Exception ex) throws Exception {
        // Los errores de seguridad los resuelve Spring Security (401 / 403).
        if (ex instanceof AccessDeniedException || ex instanceof AuthenticationException) {
            throw ex;
        }

        // 404, 405, 415... que genera el propio Spring MVC ya traen su código correcto.
        if (ex instanceof ErrorResponse respuesta) {
            int status = respuesta.getStatusCode().value();
            return construir(status, mensajeGenerico(status), null);
        }

        log.error("Error inesperado en la API", ex);
        return construir(500, "Ocurrió un error inesperado en el servidor.", null);
    }

    private static String mensajeGenerico(int status) {
        return switch (status) {
            case 400 -> "Solicitud inválida.";
            case 401 -> "Debes iniciar sesión.";
            case 403 -> "No tienes permiso para hacer esto.";
            case 404 -> "No se encontró lo que buscas.";
            case 405 -> "Operación no permitida para esta dirección.";
            case 409 -> "La operación entra en conflicto con los datos existentes.";
            case 415 -> "Tipo de contenido no soportado.";
            default -> "No se pudo completar la solicitud.";
        };
    }

    private static ResponseEntity<ErrorRespuesta> construir(int status, String mensaje, Map<String, String> errores) {
        return ResponseEntity.status(status).body(new ErrorRespuesta(status, mensaje, errores));
    }
}
