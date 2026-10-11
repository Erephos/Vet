package com.Vet.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "veterinarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Veterinario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_veterinario")
    private Integer idVeterinario;

    @Column(name = "nombre", nullable = false, length = 150)
    @NotBlank(message = "El nombre del veterinario es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
    private String nombre;

    @Column(name = "especialidad", length = 100)
    @Size(max = 100, message = "La especialidad no puede superar los 100 caracteres")
    private String especialidad;

    @Column(name = "telefono", length = 20)
    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    @Pattern(regexp = "^[0-9+() \\-]*$", message = "El teléfono solo puede tener números, espacios y los símbolos + - ( )")
    private String telefono;
}
