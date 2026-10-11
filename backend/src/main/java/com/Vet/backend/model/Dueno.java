package com.Vet.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "duenos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Dueno {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dueno")
    private Integer idDueno;

    @Column(name = "nombre", nullable = false, length = 150)
    @NotBlank(message = "El nombre del dueño es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
    private String nombre;

    @Column(name = "telefono", length = 20)
    @Size(max = 20, message = "El teléfono no puede superar los 20 caracteres")
    @Pattern(regexp = "^[0-9+() \\-]*$", message = "El teléfono solo puede tener números, espacios y los símbolos + - ( )")
    private String telefono;

    @Column(name = "direccion", length = 200)
    @Size(max = 200, message = "La dirección no puede superar los 200 caracteres")
    private String direccion;
}
