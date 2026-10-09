// Cliente HTTP base: todos los services pasan por aquí.
// La URL del backend viene de VITE_API_URL (Vercel) o cae a localhost en desarrollo.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Error que lanzamos cuando el backend responde con un código distinto de 2xx.
// Guarda el status para que la page pueda distinguir, por ejemplo, un 401 de un 409.
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

const JSON_HEADERS = { 'Content-Type': 'application/json' }

async function request(path, options) {
  const response = await fetch(`${API_BASE}${path}`, options)

  if (!response.ok) {
    throw new ApiError(`El backend respondió con error (${response.status})`, response.status)
  }

  return response
}

export async function apiGet(path) {
  const response = await request(path)
  return response.json()
}

export function apiPost(path, body) {
  return request(path, { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) })
}

export function apiPut(path, body) {
  return request(path, { method: 'PUT', headers: JSON_HEADERS, body: JSON.stringify(body) })
}

export function apiDelete(path) {
  return request(path, { method: 'DELETE' })
}
