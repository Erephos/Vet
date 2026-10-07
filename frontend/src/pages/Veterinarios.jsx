import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const FORM_VACIO = { nombre: '', especialidad: '', telefono: '' }

export default function Veterinarios() {
  const [veterinarios, setVeterinarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [form, setForm] = useState(FORM_VACIO)

  const [vetAEliminar, setVetAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

  async function cargarDatos() {
    setCargando(true)
    try {
      const res = await fetch(`${API_BASE}/veterinarios`)
      if (!res.ok) throw new Error('Respuesta no OK')
      setVeterinarios(await res.json())
    } catch (err) {
      console.error('Error cargando veterinarios:', err)
      setError('No se pudo cargar la lista de veterinarios. Verifica que el backend esté encendido.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const veterinariosFiltrados = veterinarios.filter((v) => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return true
    return (
      v.nombre.toLowerCase().includes(texto) ||
      (v.especialidad ?? '').toLowerCase().includes(texto)
    )
  })

  function iniciales(nombre) {
    return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  }

  function abrirModalAgregar() {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setErrorForm('')
    setModalAbierto(true)
  }

  function abrirModalEditar(v) {
    setEditandoId(v.idVeterinario)
    setForm({ nombre: v.nombre, especialidad: v.especialidad ?? '', telefono: v.telefono ?? '' })
    setErrorForm('')
    setModalAbierto(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorForm('')

    if (!form.nombre.trim()) {
      setErrorForm('El nombre es obligatorio.')
      return
    }

    setGuardando(true)
    try {
      const esEdicion = editandoId != null
      const url = esEdicion ? `${API_BASE}/veterinarios/${editandoId}` : `${API_BASE}/veterinarios`
      const res = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('El backend respondió con error')

      setModalAbierto(false)
      await cargarDatos()
    } catch (err) {
      console.error('Error guardando veterinario:', err)
      setErrorForm('No se pudo guardar el veterinario. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarEliminar() {
    setEliminando(true)
    setErrorEliminar('')
    try {
      const res = await fetch(`${API_BASE}/veterinarios/${vetAEliminar.idVeterinario}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('El backend respondió con error al eliminar')

      setVetAEliminar(null)
      await cargarDatos()
    } catch (err) {
      console.error('Error eliminando veterinario:', err)
      setErrorEliminar('No se pudo eliminar. Si tiene consultas o una cuenta de usuario asociada, primero hay que desvincularlas.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="page-duenos">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Veterinarios</h1>
          <p className="page-subtitle">{cargando ? '…' : `${veterinarios.length} registros`}</p>
        </div>
        <button type="button" className="btn-submit btn-inline" onClick={abrirModalAgregar}>
          <Plus size={16} /> Agregar veterinario
        </button>
      </div>

      <div className="table-search">
        <input
          type="text"
          placeholder="Buscar por nombre o especialidad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="form-message form-message-error">{error}</p>}

      <div className="panel panel-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Especialidad</th>
              <th>Teléfono</th>
              <th aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr><td colSpan={4} className="empty-hint">Cargando…</td></tr>
            )}

            {!cargando && veterinariosFiltrados.length === 0 && (
              <tr><td colSpan={4} className="empty-hint">No se encontraron veterinarios.</td></tr>
            )}

            {veterinariosFiltrados.map((v) => (
              <tr key={v.idVeterinario} className="data-row">
                <td>
                  <div className="row-person">
                    <span className="row-avatar">{iniciales(v.nombre)}</span>
                    <span>{v.nombre}</span>
                  </div>
                </td>
                <td>{v.especialidad || '—'}</td>
                <td>{v.telefono || '—'}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="icon-btn" onClick={() => abrirModalEditar(v)} aria-label="Editar">
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={() => { setErrorEliminar(''); setVetAEliminar(v) }} aria-label="Eliminar">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAbierto && (
        <Modal titulo={editandoId != null ? 'Editar veterinario' : 'Agregar veterinario'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="nombreVet">Nombre</label>
              <input
                id="nombreVet"
                className="form-control"
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="especialidadVet">Especialidad (opcional)</label>
              <input
                id="especialidadVet"
                className="form-control"
                type="text"
                value={form.especialidad}
                onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefonoVet">Teléfono (opcional)</label>
              <input
                id="telefonoVet"
                className="form-control"
                type="text"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>

            {errorForm && <p className="form-message form-message-error">{errorForm}</p>}

            <button type="submit" className="btn-submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId != null ? 'Guardar cambios' : 'Guardar veterinario'}
            </button>
          </form>
        </Modal>
      )}

      {vetAEliminar && (
        <ConfirmModal
          titulo="Eliminar veterinario"
          mensaje={`¿Seguro que quieres eliminar a "${vetAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          error={errorEliminar}
          confirmando={eliminando}
          onConfirm={confirmarEliminar}
          onCancel={() => setVetAEliminar(null)}
        />
      )}
    </div>
  )
}
