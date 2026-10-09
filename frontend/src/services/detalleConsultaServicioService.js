import { apiGet, apiPost, apiDelete } from './api.js'

export function obtenerDetalles() {
  return apiGet('/detalle-consulta-servicio')
}

export function obtenerDetallesPorConsulta(idConsulta) {
  return apiGet(`/detalle-consulta-servicio/consulta/${idConsulta}`)
}

export function agregarDetalle(datos) {
  return apiPost('/detalle-consulta-servicio', datos)
}

export function eliminarDetalle(idDetalle) {
  return apiDelete(`/detalle-consulta-servicio/${idDetalle}`)
}
