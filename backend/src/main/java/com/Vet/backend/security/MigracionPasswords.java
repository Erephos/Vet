package com.Vet.backend.security;

import com.Vet.backend.model.Usuario;
import com.Vet.backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Al arrancar, encripta con BCrypt las contraseñas que todavía estén en texto plano
 * (cuentas creadas antes de agregar seguridad). Es seguro ejecutarlo muchas veces:
 * las contraseñas que ya son hashes BCrypt no se tocan.
 */
@Component
public class MigracionPasswords implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MigracionPasswords.class);
    private static final Pattern HASH_BCRYPT = Pattern.compile("^\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}$");

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public MigracionPasswords(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        int migradas = 0;

        for (Usuario usuario : usuarioRepository.findAll()) {
            String actual = usuario.getPassword();
            if (actual != null && !HASH_BCRYPT.matcher(actual).matches()) {
                usuario.setPassword(passwordEncoder.encode(actual));
                usuarioRepository.save(usuario);
                migradas++;
            }
        }

        if (migradas > 0) {
            log.info("Migración de contraseñas: {} cuenta(s) pasaron de texto plano a BCrypt.", migradas);
        }
    }
}
