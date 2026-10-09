import { obtenerConsultas } from './consultasService.js'
import { obtenerDetalles } from './detalleConsultaServicioService.js'

// Datos base para los reportes: consultas y servicios aplicados.
export async function obtenerDatosReportes() {
  const [consultas, detalles] = await Promise.all([obtenerConsultas(), obtenerDetalles()])

  return { consultas, detalles }
}
