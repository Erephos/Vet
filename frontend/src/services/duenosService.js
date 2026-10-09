import { apiGet, apiPost, apiPut, apiDelete } from './api.js'

export function obtenerDuenos() {
  return apiGet('/duenos')
}

export function crearDueno(datos) {
  return apiPost('/duenos', datos)
}

export function actualizarDueno(id, datos) {
  return apiPut(`/duenos/${id}`, datos)
}

export function eliminarDueno(id) {
  return apiDelete(`/duenos/${id}`)
}
