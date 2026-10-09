import { obtenerConsultas } from './consultasService.js'
import { obtenerMascotas } from './mascotasService.js'
import { obtenerDuenos } from './duenosService.js'
import { obtenerVeterinarios } from './veterinariosService.js'

// Datos que necesita el dashboard (Home) en una sola llamada.
export async function obtenerDatosDashboard() {
  const [consultas, mascotas, duenos, veterinarios] = await Promise.all([
    obtenerConsultas(),
    obtenerMascotas(),
    obtenerDuenos(),
    obtenerVeterinarios(),
  ])

  return { consultas, mascotas, duenos, veterinarios }
}
