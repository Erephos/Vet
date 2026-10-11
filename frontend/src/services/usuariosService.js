import { apiGet, apiPost, apiDelete } from './api.js'

// POST /api/usuarios/login — devuelve { token, usuario }.
// Si las credenciales son incorrectas lanza ApiError con status 401.
export async function iniciarSesion(email, password) {
  const response = await apiPost('/usuarios/login', { email, password }, { conAuth: false })
  return response.json()
}

// POST /api/usuarios (solo administrador) — si el correo ya existe lanza ApiError con status 409.
export function crearUsuario(datos) {
  return apiPost('/usuarios', datos)
}

export function obtenerUsuarios() {
  return apiGet('/usuarios')
}

// DELETE /api/usuarios/{id} (solo administrador).
// Lanza ApiError 409 si es tu propia cuenta o el último administrador.
export function eliminarUsuario(id) {
  return apiDelete(`/usuarios/${id}`)
}
