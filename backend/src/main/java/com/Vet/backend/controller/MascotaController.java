package com.Vet.backend.controller;

import com.Vet.backend.dto.ImpactoEliminacionDTO;
import com.Vet.backend.model.Mascota;
import com.Vet.backend.services.EliminacionService;
import com.Vet.backend.services.MascotaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
public class MascotaController {

    @Autowired
    private MascotaService mascotaService;

    @Autowired
    private EliminacionService eliminacionService;

    @GetMapping
    public List<Mascota> listar() {
        return mascotaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Mascota> obtenerPorId(@PathVariable Integer id) {
        return mascotaService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/dueno/{idDueno}")
    public List<Mascota> listarPorDueno(@PathVariable Integer idDueno) {
        return mascotaService.findByDueno(idDueno);
    }

    @PostMapping
    public ResponseEntity<Mascota> crear(@Valid @RequestBody Mascota mascota) {
        Mascota guardada = mascotaService.save(mascota);
        return ResponseEntity.status(HttpStatus.CREATED).body(guardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Mascota> actualizar(@PathVariable Integer id, @Valid @RequestBody Mascota mascota) {
        if (!mascotaService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        mascota.setIdMascota(id);
        return ResponseEntity.ok(mascotaService.save(mascota));
    }

    // Qué otros datos se eliminarán junto con este registro (para avisar antes de confirmar).
    @GetMapping("/{id}/impacto")
    public ResponseEntity<ImpactoEliminacionDTO> impacto(@PathVariable Integer id) {
        if (!mascotaService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(eliminacionService.impactoMascota(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        if (!mascotaService.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eliminacionService.eliminarMascota(id);
        return ResponseEntity.noContent().build();
    }
}
