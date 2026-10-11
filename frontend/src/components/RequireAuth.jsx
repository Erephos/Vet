import { Navigate, useLocation } from 'react-router-dom'
import { haySesion, esAdmin } from '../lib/session.js'

// Protege una ruta: exige sesión vigente y, con soloAdmin, además el rol de administrador.
export default function RequireAuth({ children, soloAdmin = false }) {
  const location = useLocation()

  if (!haySesion()) {
    // Guarda a dónde quería ir, por si luego quieres redirigir de vuelta
    // ahí mismo después de loguearse.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (soloAdmin && !esAdmin()) {
    return <Navigate to="/" replace />
  }

  return children
}
