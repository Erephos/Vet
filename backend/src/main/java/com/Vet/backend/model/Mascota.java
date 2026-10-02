package com.Vet.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "mascotas")
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private int edad;

    // Relación con Dueño (Ejemplo)
    @ManyToOne
    @JoinColumn(name = "dueno_id")
    private Dueno dueno;

    // Relación con Especie y Raza (según tu estructura)
    @ManyToOne
    @JoinColumn(name = "especie_id")
    private Especie especie;

    // Getters y Setters vacíos para mantener brevedad
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}