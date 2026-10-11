package com.Vet.backend.controller;

import com.Vet.backend.dto.LoginRequestDTO;
import com.Vet.backend.dto.LoginResponseDTO;
import com.Vet.backend.model.Usuario;
import com.Vet.backend.security.JwtService;
import com.Vet.backend.security.Roles;
import com.Vet.backend.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

/**
 * Los errores se lanzan como ResponseStatusException y los convierte ManejadorErrores
 * al formato JSON único de la API.
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private JwtService jwtService;

    // Solo ADMIN (regla en SecurityConfig). La contraseña no se serializa (ver Usuario.java).
    @GetMapping
    public List<Usuario> listarTodos() {
        return usuarioService.obtenerTodos();
    }

    // Solo ADMIN (regla en SecurityConfig): el registro público ya no existe.
    @PostMapping
    public ResponseEntity<Usuario> crearUsuario(@RequestBody Usuario usuario) {
        if (usuario.getEmail() == null || usuario.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo es obligatorio.");
        }

        if (usuario.getPassword() == null || usuario.getPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La contraseña debe tener al menos 6 caracteres.");
        }

        if (!Roles.esRolValido(usuario.getRol())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El rol no es válido.");
        }

        usuario.setEmail(usuario.getEmail().trim());

        if (usuarioService.existePorEmail(usuario.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ese correo ya está registrado.");
        }

        Usuario nuevoUsuario = usuarioService.crear(usuario);
        return new ResponseEntity<>(nuevoUsuario, HttpStatus.CREATED);
    }

    // Solo ADMIN (regla en SecurityConfig).
    // Reglas: no puedes borrar tu propia cuenta ni al último administrador.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id, Authentication autenticacion) {
        Usuario objetivo = usuarioService.obtenerPorId(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "La cuenta no existe."));

        if (objetivo.getEmail().equals(autenticacion.getName())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No puedes eliminar tu propia cuenta.");
        }

        if (Roles.esAdmin(objetivo.getRol()) && usuarioService.contarAdministradores() <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "No se puede eliminar al último administrador.");
        }

        try {
            usuarioService.eliminar(id);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede eliminar: la cuenta está siendo usada por otros datos.");
        }

        return ResponseEntity.noContent().build();
    }

    // Único endpoint público. Si las credenciales son correctas devuelve { token, usuario }.
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioService.autenticar(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );

        if (usuarioOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos.");
        }

        Usuario usuario = usuarioOpt.get();
        String token = jwtService.generarToken(usuario);
        return ResponseEntity.ok(new LoginResponseDTO(token, usuario));
    }
}
