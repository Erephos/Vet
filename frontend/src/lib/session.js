const SESSION_KEY = 'ximedgar_session'
const TOKEN_KEY = 'ximedgar_token'

// Guarda los datos del usuario (sin contraseña) y el token JWT que devolvió el login.
export function guardarSesion(usuario, token) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(usuario))
  localStorage.setItem(TOKEN_KEY, token)
}

export function obtenerSesion() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function borrarSesion() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

// Lee la fecha de expiración (claim "exp") del token. Es solo para mejorar la experiencia
// (mandar al login al expirar); quien realmente valida el token es el backend.
function tokenVigente(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const relleno = '='.repeat((4 - (payload.length % 4)) % 4)
    const { exp } = JSON.parse(atob(payload + relleno))
    return typeof exp === 'number' && exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export function haySesion() {
  const token = obtenerToken()
  return obtenerSesion() !== null && token !== null && tokenVigente(token)
}

// En la base conviven "admin" y "ADMINISTRADOR": ambos son administrador.
export function esAdmin(usuario = obtenerSesion()) {
  const rol = (usuario?.rol ?? '').trim().toLowerCase()
  return rol === 'admin' || rol === 'administrador'
}
