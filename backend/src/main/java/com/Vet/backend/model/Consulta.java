package com.Vet.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Integer idConsulta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mascota", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @NotNull(message = "Debes elegir una mascota")
    private Mascota mascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_veterinario", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @NotNull(message = "Debes elegir un veterinario")
    private Veterinario veterinario;

    @Column(name = "fecha_hora", nullable = false)
    @NotNull(message = "La fecha y hora de la consulta son obligatorias")
    private LocalDateTime fechaHora;

    @Column(name = "diagnostico", length = 500)
    @Size(max = 500, message = "El diagnóstico no puede superar los 500 caracteres")
    private String diagnostico;

    @Column(name = "costo_base", precision = 10, scale = 2)
    @PositiveOrZero(message = "El costo base no puede ser negativo")
    @Digits(integer = 8, fraction = 2, message = "El costo base admite hasta 8 enteros y 2 decimales")
    private BigDecimal costoBase;
}
