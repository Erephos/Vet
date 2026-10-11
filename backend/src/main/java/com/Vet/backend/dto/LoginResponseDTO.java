package com.Vet.backend.dto;

import com.Vet.backend.model.Usuario;

/** Respuesta del login: el token para las siguientes peticiones y los datos del usuario (sin contraseña). */
public record LoginResponseDTO(String token, Usuario usuario) {
}
