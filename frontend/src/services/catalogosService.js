import { apiGet, apiPost, apiPut, apiDelete } from './api.js'

// ---- Especies ----
export function obtenerEspecies() {
  return apiGet('/especies')
}

export function crearEspecie(datos) {
  return apiPost('/especies', datos)
}

export function actualizarEspecie(id, datos) {
  return apiPut(`/especies/${id}`, datos)
}

export function eliminarEspecie(id) {
  return apiDelete(`/especies/${id}`)
}

// ---- Razas ----
export function obtenerRazas() {
  return apiGet('/razas')
}

export function crearRaza(datos) {
  return apiPost('/razas', datos)
}

export function actualizarRaza(id, datos) {
  return apiPut(`/razas/${id}`, datos)
}

export function eliminarRaza(id) {
  return apiDelete(`/razas/${id}`)
}
