package com.Vet.backend.config;

import com.Vet.backend.repository.UsuarioRepository;
import com.Vet.backend.security.JwtAuthFilter;
import com.Vet.backend.security.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Reglas de acceso de toda la API.
 *
 *  - POST /api/usuarios/login ........ público (es la única puerta de entrada)
 *  - /api/usuarios ................... solo ADMIN (listar y crear cuentas)
 *  - servicios, razas, especies,
 *    veterinarios .................... todos los usuarios leen (GET); solo ADMIN modifica
 *  - dueños, mascotas, consultas,
 *    detalle de consulta ............. cualquier usuario autenticado (ADMIN o VETERINARIO)
 *
 * Sin token válido la API responde 401; con token pero sin permiso, 403.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String[] CATALOGOS_GET = {
            "/api/servicios", "/api/servicios/**",
            "/api/razas", "/api/razas/**",
            "/api/especies", "/api/especies/**",
            "/api/veterinarios", "/api/veterinarios/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtService jwtService,
                                                   UsuarioRepository usuarioRepository) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // API sin cookies de sesión: se usa token en el encabezado
                .cors(Customizer.withDefaults()) // usa el CorsConfigurationSource de CorsConfig
                .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(errores -> errores
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .authorizeHttpRequests(reglas -> reglas
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/usuarios/login").permitAll()
                        .requestMatchers("/api/usuarios", "/api/usuarios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, CATALOGOS_GET).authenticated()
                        .requestMatchers(CATALOGOS_GET).hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthFilter(jwtService, usuarioRepository),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
