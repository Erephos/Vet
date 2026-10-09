import { useEffect, useState } from 'react'
import { obtenerSesion } from '../lib/session.js'
import { obtenerUsuarios } from '../services/usuariosService.js'
import '../styles/pages/Perfil.css'

export default function Perfil() {
  const sesion = obtenerSesion()
  const esAdmin = sesion?.rol === 'admin' || sesion?.rol === 'ADMINISTRADOR'

  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(esAdmin)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!esAdmin) return

    async function cargarUsuarios() {
      try {
        setUsuarios(await obtenerUsuarios())
      } catch (err) {
        console.error('Error cargando cuentas:', err)
        setError('No se pudo cargar la lista de cuentas. Verifica que el backend esté encendido.')
      } finally {
        setCargando(false)
      }
    }

    cargarUsuarios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function iniciales(texto) {
    return texto
      .split(/[@.\s]/)
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  function rolLegible(rol) {
    return rol === 'admin' || rol === 'ADMINISTRADOR' ? 'Administrador' : 'Veterinario'
  }

  return (
    <div className="page-duenos">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Perfil</h1>
          <p className="page-subtitle">Datos de la cuenta con la que iniciaste sesión</p>
        </div>
      </div>

      <div className="panel" style={{ maxWidth: 480, marginBottom: 20 }}>
        <div className="perfil-header">
          <span className="row-avatar perfil-avatar">{iniciales(sesion?.email ?? '?')}</span>
          <div>
            <div className="today-item-title">{sesion?.email}</div>
            <div className="today-item-sub">{rolLegible(sesion?.rol)}</div>
          </div>
        </div>

        {sesion?.veterinario && (
          <>
            <div className="detalle-linea" style={{ marginTop: 18 }}>
              <strong>Nombre:</strong> {sesion.veterinario.nombre}
            </div>
            <div className="detalle-linea">
              <strong>Especialidad:</strong> {sesion.veterinario.especialidad || 'Sin especialidad registrada'}
            </div>
            <div className="detalle-linea">
              <strong>Teléfono:</strong> {sesion.veterinario.telefono || '—'}
            </div>
          </>
        )}

        <p className="empty-hint" style={{ marginTop: 18 }}>
          Editar estos datos todavía no está conectado a un endpoint del backend.
        </p>
      </div>

      {esAdmin && (
        <>
          <h2 style={{ marginBottom: 12 }}>Cuentas registradas</h2>

          {error && <p className="form-message form-message-error">{error}</p>}

          <div className="panel panel-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Veterinario asociado</th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr><td colSpan={3} className="empty-hint">Cargando…</td></tr>
                )}

                {!cargando && usuarios.length === 0 && (
                  <tr><td colSpan={3} className="empty-hint">No hay cuentas registradas.</td></tr>
                )}

                {usuarios.map((u) => (
                  <tr key={u.idUsuario} className="data-row">
                    <td>
                      <div className="row-person">
                        <span className="row-avatar">{iniciales(u.email)}</span>
                        <span>{u.email}</span>
                      </div>
                    </td>
                    <td>{rolLegible(u.rol)}</td>
                    <td>{u.veterinario?.nombre || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="empty-hint" style={{ marginTop: 10 }}>
            Esta lista es solo de lectura por ahora — tu backend todavía no tiene
            endpoints para editar o eliminar cuentas.
          </p>
        </>
      )}
    </div>
  )
}
