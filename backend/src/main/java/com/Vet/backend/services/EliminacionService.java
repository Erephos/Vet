package com.Vet.backend.services;

import com.Vet.backend.dto.ImpactoEliminacionDTO;
import com.Vet.backend.model.Consulta;
import com.Vet.backend.model.Mascota;
import com.Vet.backend.repository.ConsultaRepository;
import com.Vet.backend.repository.DetalleConsultaServicioRepository;
import com.Vet.backend.repository.DuenoRepository;
import com.Vet.backend.repository.EspecieRepository;
import com.Vet.backend.repository.MascotaRepository;
import com.Vet.backend.repository.RazaRepository;
import com.Vet.backend.repository.ServicioRepository;
import com.Vet.backend.repository.UsuarioRepository;
import com.Vet.backend.repository.VeterinarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Reglas de borrado de todo el sistema.
 *
 * EN CASCADA (el historial depende de su dueño, mascota o consulta):
 *   dueño -> mascotas -> consultas -> servicios aplicados
 *   mascota -> consultas -> servicios aplicados
 *   consulta -> servicios aplicados
 *
 * BLOQUEADO (borrarlo arrastraría datos que no tienen que ver):
 *   raza en uso, especie con razas, servicio ya aplicado, veterinario con consultas o cuentas.
 *
 * Cada método es una sola transacción: si algo falla, no se borra nada a medias.
 * Se borra siempre de lo más dependiente a lo menos, y se hace flush entre niveles.
 */
@Service
public class EliminacionService {

    private final DuenoRepository duenoRepository;
    private final MascotaRepository mascotaRepository;
    private final ConsultaRepository consultaRepository;
    private final DetalleConsultaServicioRepository detalleRepository;
    private final RazaRepository razaRepository;
    private final EspecieRepository especieRepository;
    private final ServicioRepository servicioRepository;
    private final VeterinarioRepository veterinarioRepository;
    private final UsuarioRepository usuarioRepository;

    public EliminacionService(DuenoRepository duenoRepository,
                              MascotaRepository mascotaRepository,
                              ConsultaRepository consultaRepository,
                              DetalleConsultaServicioRepository detalleRepository,
                              RazaRepository razaRepository,
                              EspecieRepository especieRepository,
                              ServicioRepository servicioRepository,
                              VeterinarioRepository veterinarioRepository,
                              UsuarioRepository usuarioRepository) {
        this.duenoRepository = duenoRepository;
        this.mascotaRepository = mascotaRepository;
        this.consultaRepository = consultaRepository;
        this.detalleRepository = detalleRepository;
        this.razaRepository = razaRepository;
        this.especieRepository = especieRepository;
        this.servicioRepository = servicioRepository;
        this.veterinarioRepository = veterinarioRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ------------------------------------------------------------------ impacto (solo cuenta)

    @Transactional(readOnly = true)
    public ImpactoEliminacionDTO impactoConsulta(Integer idConsulta) {
        return new ImpactoEliminacionDTO(0, 0, detalleRepository.countByConsulta_IdConsulta(idConsulta));
    }

    @Transactional(readOnly = true)
    public ImpactoEliminacionDTO impactoMascota(Integer idMascota) {
        long consultas = 0;
        long servicios = 0;
        for (Consulta c : consultaRepository.findByMascota_IdMascota(idMascota)) {
            consultas++;
            servicios += detalleRepository.countByConsulta_IdConsulta(c.getIdConsulta());
        }
        return new ImpactoEliminacionDTO(0, consultas, servicios);
    }

    @Transactional(readOnly = true)
    public ImpactoEliminacionDTO impactoDueno(Integer idDueno) {
        long mascotas = 0;
        long consultas = 0;
        long servicios = 0;
        for (Mascota m : mascotaRepository.findByDueno_IdDueno(idDueno)) {
            mascotas++;
            for (Consulta c : consultaRepository.findByMascota_IdMascota(m.getIdMascota())) {
                consultas++;
                servicios += detalleRepository.countByConsulta_IdConsulta(c.getIdConsulta());
            }
        }
        return new ImpactoEliminacionDTO(mascotas, consultas, servicios);
    }

    // ------------------------------------------------------------------ cascada

    @Transactional
    public void eliminarConsulta(Integer idConsulta) {
        detalleRepository.deleteAll(detalleRepository.findByConsulta_IdConsulta(idConsulta));
        detalleRepository.flush();
        consultaRepository.deleteById(idConsulta);
    }

    @Transactional
    public void eliminarMascota(Integer idMascota) {
        borrarConsultasDeMascota(idMascota);
        mascotaRepository.deleteById(idMascota);
    }

    @Transactional
    public void eliminarDueno(Integer idDueno) {
        for (Mascota m : mascotaRepository.findByDueno_IdDueno(idDueno)) {
            borrarConsultasDeMascota(m.getIdMascota());
            mascotaRepository.delete(m);
        }
        mascotaRepository.flush();
        duenoRepository.deleteById(idDueno);
    }

    // Borra los servicios aplicados y luego las consultas de una mascota.
    private void borrarConsultasDeMascota(Integer idMascota) {
        for (Consulta c : consultaRepository.findByMascota_IdMascota(idMascota)) {
            detalleRepository.deleteAll(detalleRepository.findByConsulta_IdConsulta(c.getIdConsulta()));
        }
        detalleRepository.flush();

        consultaRepository.deleteAll(consultaRepository.findByMascota_IdMascota(idMascota));
        consultaRepository.flush();
    }

    // ------------------------------------------------------------------ bloqueos con motivo claro

    @Transactional
    public void eliminarRaza(Integer idRaza) {
        long mascotas = mascotaRepository.countByRaza_IdRaza(idRaza);
        if (mascotas > 0) {
            throw conflicto("No se puede eliminar la raza: "
                    + plural(mascotas, "mascota la usa", "mascotas la usan")
                    + ". Cambia primero la raza de esas mascotas.");
        }
        razaRepository.deleteById(idRaza);
    }

    @Transactional
    public void eliminarEspecie(Integer idEspecie) {
        long razas = razaRepository.findByEspecie_IdEspecie(idEspecie).size();
        if (razas > 0) {
            throw conflicto("No se puede eliminar la especie: tiene "
                    + plural(razas, "raza registrada", "razas registradas")
                    + ". Elimina o cambia primero esas razas.");
        }
        especieRepository.deleteById(idEspecie);
    }

    @Transactional
    public void eliminarServicio(Integer idServicio) {
        long usos = detalleRepository.countByServicio_IdServicio(idServicio);
        if (usos > 0) {
            throw conflicto("No se puede eliminar el servicio: ya se aplicó en "
                    + plural(usos, "consulta", "consultas")
                    + ". Quita primero ese servicio de esas consultas.");
        }
        servicioRepository.deleteById(idServicio);
    }

    @Transactional
    public void eliminarVeterinario(Integer idVeterinario) {
        long consultas = consultaRepository.findByVeterinario_IdVeterinario(idVeterinario).size();
        long cuentas = usuarioRepository.countByVeterinario_IdVeterinario(idVeterinario);

        if (consultas > 0 || cuentas > 0) {
            StringBuilder motivo = new StringBuilder("No se puede eliminar al veterinario:");
            if (consultas > 0) {
                motivo.append(" atendió ").append(plural(consultas, "consulta", "consultas")).append(".");
            }
            if (cuentas > 0) {
                motivo.append(" Tiene ").append(plural(cuentas, "cuenta asociada", "cuentas asociadas")).append(".");
            }
            throw conflicto(motivo.toString());
        }
        veterinarioRepository.deleteById(idVeterinario);
    }

    // ------------------------------------------------------------------ utilidades

    private static ResponseStatusException conflicto(String mensaje) {
        return new ResponseStatusException(HttpStatus.CONFLICT, mensaje);
    }

    private static String plural(long cantidad, String singular, String plural) {
        return cantidad + " " + (cantidad == 1 ? singular : plural);
    }
}
