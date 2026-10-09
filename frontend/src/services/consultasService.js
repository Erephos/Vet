import { apiGet, apiPost, apiPut, apiDelete } from './api.js'

export function obtenerConsultas() {
  return apiGet('/consultas')
}

export function crearConsulta(datos) {
  return apiPost('/consultas', datos)
}

export function actualizarConsulta(id, datos) {
  return apiPut(`/consultas/${id}`, datos)
}

export function eliminarConsulta(id) {
  return apiDelete(`/consultas/${id}`)
}

export function obtenerConsultasPorMascota(idMascota) {
  return apiGet(`/consultas/mascota/${idMascota}`)
}
