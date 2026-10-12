import { obtenerDuenos } from './duenosService.js'
import { obtenerMascotas } from './mascotasService.js'
import { obtenerConsultas } from './consultasService.js'
import { obtenerVeterinarios } from './veterinariosService.js'
import { obtenerServicios } from './serviciosService.js'

// Datos que necesita la barra de búsqueda superior (todos los listados principales).
export async function obtenerDatosBusqueda() {
  const [duenos, mascotas, consultas, veterinarios, servicios] = await Promise.all([
    obtenerDuenos(),
    obtenerMascotas(),
    obtenerConsultas(),
    obtenerVeterinarios(),
    obtenerServicios(),
  ])

  return { duenos, mascotas, consultas, veterinarios, servicios }
}
