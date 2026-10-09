import { apiGet, apiPost, apiPut, apiDelete } from './api.js'

export function obtenerServicios() {
  return apiGet('/servicios')
}

export function crearServicio(datos) {
  return apiPost('/servicios', datos)
}

export function actualizarServicio(id, datos) {
  return apiPut(`/servicios/${id}`, datos)
}

export function eliminarServicio(id) {
  return apiDelete(`/servicios/${id}`)
}
