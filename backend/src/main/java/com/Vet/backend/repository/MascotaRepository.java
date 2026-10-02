package com.Vet.backend.repository;

import com.Vet.backend.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    // Puedes agregar consultas personalizadas aquí, ej:
    // List<Mascota> findByDuenoId(Long duenoId);
}