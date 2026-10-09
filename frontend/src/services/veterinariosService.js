import { apiGet, apiPost, apiPut, apiDelete } from './api.js'

export function obtenerVeterinarios() {
  return apiGet('/veterinarios')
}

export function crearVeterinario(datos) {
  return apiPost('/veterinarios', datos)
}

export function actualizarVeterinario(id, datos) {
  return apiPut(`/veterinarios/${id}`, datos)
}

export function eliminarVeterinario(id) {
  return apiDelete(`/veterinarios/${id}`)
}
