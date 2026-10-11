import { obtenerToken, borrarSesion } from '../lib/session.js'

// Cliente HTTP base: todos los services pasan por aquí.
// La URL del backend viene de VITE_API_URL (Vercel) o cae a localhost en desarrollo.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Error que lanzamos cuando el backend responde con un código distinto de 2xx.
// Guarda el status para que la page pueda distinguir, por ejemplo, un 401 de un 409.
export class ApiError extends Error {
  constructor(message, status, detalle = '', errores = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detalle = detalle // motivo en texto que explica el backend
    this.errores = errores // { campo: motivo } cuando son errores de validación
  }
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

// Si el backend dice 401 (token vencido o inválido) cerramos la sesión y volvemos al login.
function cerrarSesionVencida() {
  borrarSesion()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

// El backend responde errores como { status, mensaje, errores }. Si no es JSON, usamos el texto tal cual.
async function leerDetalle(response) {
  let texto = ''
  try {
    texto = await response.text()
  } catch {
    return { detalle: '', errores: null }
  }

  try {
    const cuerpo = JSON.parse(texto)
    return { detalle: cuerpo.mensaje || '', errores: cuerpo.errores || null }
  } catch {
    return { detalle: texto, errores: null }
  }
}

// opciones.conAuth = false solo se usa en el login (todavía no hay token que enviar).
async function request(path, options = {}, { conAuth = true } = {}) {
  const headers = { ...options.headers }
  const token = obtenerToken()
  if (conAuth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!response.ok) {
    if (response.status === 401 && conAuth) {
      cerrarSesionVencida()
    }
    const { detalle, errores } = await leerDetalle(response)
    throw new ApiError(`El backend respondió con error (${response.status})`, response.status, detalle, errores)
  }

  return response
}

export async function apiGet(path) {
  const response = await request(path)
  return response.json()
}

export function apiPost(path, body, opciones) {
  return request(path, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) }, opciones)
}

export function apiPut(path, body, opciones) {
  return request(path, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(body) }, opciones)
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' })
}
