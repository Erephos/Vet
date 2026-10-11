package com.Vet.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "especies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Especie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_especie")
    private Integer idEspecie;

    @Column(name = "nombre_especie", nullable = false, length = 100)
    @NotBlank(message = "El nombre de la especie es obligatorio")
    @Size(max = 100, message = "El nombre de la especie no puede superar los 100 caracteres")
    private String nombreEspecie;
}
