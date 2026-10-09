import { apiGet, apiPost } from './api.js'

// POST /api/usuarios/login — devuelve el Usuario completo.
// Si las credenciales son incorrectas lanza ApiError con status 401.
export async function iniciarSesion(email, password) {
  const response = await apiPost('/usuarios/login', { email, password })
  return response.json()
}

// POST /api/usuarios — si el correo ya existe lanza ApiError con status 409.
export function crearUsuario(datos) {
  return apiPost('/usuarios', datos)
}

export function obtenerUsuarios() {
  return apiGet('/usuarios')
}
