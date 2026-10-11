package com.Vet.backend.security;

/**
 * Normaliza los roles guardados en la tabla usuarios.
 * En la base conviven valores como "admin" y "ADMINISTRADOR"; aquí ambos significan lo mismo.
 */
public final class Roles {

    public static final String ADMIN = "ADMIN";
    public static final String VETERINARIO = "VETERINARIO";

    private Roles() {
    }

    public static boolean esAdmin(String rol) {
        if (rol == null) {
            return false;
        }
        String r = rol.trim();
        return r.equalsIgnoreCase("admin") || r.equalsIgnoreCase("administrador");
    }

    public static boolean esVeterinario(String rol) {
        return rol != null && rol.trim().equalsIgnoreCase("veterinario");
    }

    public static boolean esRolValido(String rol) {
        return esAdmin(rol) || esVeterinario(rol);
    }

    /** Nombre de la autoridad que Spring Security entiende: ROLE_ADMIN o ROLE_VETERINARIO. */
    public static String autoridad(String rol) {
        return "ROLE_" + (esAdmin(rol) ? ADMIN : VETERINARIO);
    }
}
