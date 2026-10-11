import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Trash2 } from 'lucide-react'
import { obtenerSesion, esAdmin } from '../lib/session.js'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { obtenerUsuarios, eliminarUsuario } from '../services/usuariosService.js'
import '../styles/pages/Perfil.css'

export default function Perfil() {
  const navigate = useNavigate()
  const sesion = obtenerSesion()
  const soyAdmin = esAdmin(sesion)

  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(soyAdmin)
  const [error, setError] = useState('')
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

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

  useEffect(() => {
    if (!soyAdmin) return
    cargarUsuarios()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function confirmarEliminar() {
    setEliminando(true)
    setErrorEliminar('')
    try {
      await eliminarUsuario(usuarioAEliminar.idUsuario)

      setUsuarioAEliminar(null)
      await cargarUsuarios()
    } catch (err) {
      console.error('Error eliminando cuenta:', err)
      setErrorEliminar(
        err.status === 409 && err.detalle
          ? err.detalle
          : 'No se pudo eliminar la cuenta. Intenta de nuevo.'
      )
    } finally {
      setEliminando(false)
    }
  }

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
    return esAdmin({ rol }) ? 'Administrador' : 'Veterinario'
  }

  return (
    <div className="page-duenos">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Perfil</h1>
          <p className="page-subtitle">Datos de la cuenta con la que iniciaste sesión</p>
        </div>
        {soyAdmin && (
          <button type="button" className="btn-submit btn-inline" onClick={() => navigate('/agregar-cuenta')}>
            <UserPlus size={16} /> Crear cuenta
          </button>
        )}
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

      {soyAdmin && (
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
                  <th aria-hidden="true"></th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr><td colSpan={4} className="empty-hint">Cargando…</td></tr>
                )}

                {!cargando && usuarios.length === 0 && (
                  <tr><td colSpan={4} className="empty-hint">No hay cuentas registradas.</td></tr>
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
                    <td>
                      {u.idUsuario !== sesion?.idUsuario && (
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-btn icon-btn-danger"
                            onClick={() => { setErrorEliminar(''); setUsuarioAEliminar(u) }}
                            aria-label="Eliminar cuenta"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="empty-hint" style={{ marginTop: 10 }}>
            No puedes eliminar tu propia cuenta ni al último administrador. Para cambiar los datos de una
            cuenta, elimínala y créala de nuevo.
          </p>
        </>
      )}

      {usuarioAEliminar && (
        <ConfirmModal
          titulo="Eliminar cuenta"
          mensaje={`¿Seguro que quieres eliminar la cuenta "${usuarioAEliminar.email}"? Esta persona ya no podrá iniciar sesión.`}
          error={errorEliminar}
          confirmando={eliminando}
          onConfirm={confirmarEliminar}
          onCancel={() => setUsuarioAEliminar(null)}
        />
      )}
    </div>
  )
}
