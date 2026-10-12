package com.Vet.backend.dto;

/** Qué otros datos se eliminarán junto con un registro (para avisar antes de confirmar). */
public record ImpactoEliminacionDTO(long mascotas, long consultas, long serviciosAplicados) {
}
