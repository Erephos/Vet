package com.Vet.backend.security;

import com.Vet.backend.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Lee el encabezado "Authorization: Bearer <token>". Si el token es válido y el usuario sigue
 * existiendo, marca la petición como autenticada con el rol actual del usuario en la base.
 * Si no hay token o es inválido, no hace nada: las reglas de SecurityConfig responderán 401.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String PREFIJO = "Bearer ";

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith(PREFIJO)) {
            String token = header.substring(PREFIJO.length());

            jwtService.obtenerEmail(token)
                    .flatMap(usuarioRepository::findByEmail)
                    .ifPresent(usuario -> {
                        UsernamePasswordAuthenticationToken autenticacion =
                                new UsernamePasswordAuthenticationToken(
                                        usuario.getEmail(),
                                        null,
                                        List.of(new SimpleGrantedAuthority(Roles.autoridad(usuario.getRol()))));
                        SecurityContextHolder.getContext().setAuthentication(autenticacion);
                    });
        }

        filterChain.doFilter(request, response);
    }
}
