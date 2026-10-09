import { apiGet, apiPost, apiPut, apiDelete } from './api.js'

export function obtenerMascotas() {
  return apiGet('/mascotas')
}

export function crearMascota(datos) {
  return apiPost('/mascotas', datos)
}

export function actualizarMascota(id, datos) {
  return apiPut(`/mascotas/${id}`, datos)
}

export function eliminarMascota(id) {
  return apiDelete(`/mascotas/${id}`)
}
