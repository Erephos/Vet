import { useEffect, useState } from 'react'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const FORM_VACIO = { nombreServicio: '', precio: '' }

export default function Servicios() {
  const [servicios, setServicios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [form, setForm] = useState(FORM_VACIO)

  const [servicioAEliminar, setServicioAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

  async function cargarDatos() {
    setCargando(true)
    try {
      const res = await fetch(`${API_BASE}/servicios`)
      if (!res.ok) throw new Error('Respuesta no OK')
      setServicios(await res.json())
    } catch (err) {
      console.error('Error cargando servicios:', err)
      setError('No se pudo cargar la lista de servicios. Verifica que el backend esté encendido.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const serviciosFiltrados = servicios.filter((s) =>
    s.nombreServicio.toLowerCase().includes(busqueda.trim().toLowerCase()),
  )

  function abrirModalAgregar() {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setErrorForm('')
    setModalAbierto(true)
  }

  function abrirModalEditar(s) {
    setEditandoId(s.idServicio)
    setForm({ nombreServicio: s.nombreServicio, precio: String(s.precio) })
    setErrorForm('')
    setModalAbierto(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorForm('')

    if (!form.nombreServicio.trim() || !form.precio) {
      setErrorForm('Completa el nombre y el precio.')
      return
    }

    setGuardando(true)
    try {
      const esEdicion = editandoId != null
      const url = esEdicion ? `${API_BASE}/servicios/${editandoId}` : `${API_BASE}/servicios`
      const res = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreServicio: form.nombreServicio, precio: Number(form.precio) }),
      })

      if (!res.ok) throw new Error('El backend respondió con error')

      setModalAbierto(false)
      await cargarDatos()
    } catch (err) {
      console.error('Error guardando servicio:', err)
      setErrorForm('No se pudo guardar el servicio. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarEliminar() {
    setEliminando(true)
    setErrorEliminar('')
    try {
      const res = await fetch(`${API_BASE}/servicios/${servicioAEliminar.idServicio}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('El backend respondió con error al eliminar')

      setServicioAEliminar(null)
      await cargarDatos()
    } catch (err) {
      console.error('Error eliminando servicio:', err)
      setErrorEliminar('No se pudo eliminar. Si este servicio ya se aplicó en alguna consulta, no se puede borrar.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="page-duenos">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Servicios</h1>
          <p className="page-subtitle">{cargando ? '…' : `${servicios.length} registros`}</p>
        </div>
        <button type="button" className="btn-submit btn-inline" onClick={abrirModalAgregar}>
          <Plus size={16} /> Agregar servicio
        </button>
      </div>

      <div className="table-search">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="form-message form-message-error">{error}</p>}

      <div className="panel panel-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Precio</th>
              <th aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr><td colSpan={3} className="empty-hint">Cargando…</td></tr>
            )}

            {!cargando && serviciosFiltrados.length === 0 && (
              <tr><td colSpan={3} className="empty-hint">No se encontraron servicios.</td></tr>
            )}

            {serviciosFiltrados.map((s) => (
              <tr key={s.idServicio} className="data-row">
                <td>
                  <div className="row-person">
                    <span className="row-avatar row-avatar-icon"><Tag size={15} /></span>
                    <span>{s.nombreServicio}</span>
                  </div>
                </td>
                <td>S/ {Number(s.precio).toFixed(2)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="icon-btn" onClick={() => abrirModalEditar(s)} aria-label="Editar">
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={() => { setErrorEliminar(''); setServicioAEliminar(s) }} aria-label="Eliminar">
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
        <Modal titulo={editandoId != null ? 'Editar servicio' : 'Agregar servicio'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="nombreServicio">Nombre del servicio</label>
              <input
                id="nombreServicio"
                className="form-control"
                type="text"
                value={form.nombreServicio}
                onChange={(e) => setForm({ ...form, nombreServicio: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="precioServicio">Precio (S/)</label>
              <input
                id="precioServicio"
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                required
              />
            </div>

            {errorForm && <p className="form-message form-message-error">{errorForm}</p>}

            <button type="submit" className="btn-submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId != null ? 'Guardar cambios' : 'Guardar servicio'}
            </button>
          </form>
        </Modal>
      )}

      {servicioAEliminar && (
        <ConfirmModal
          titulo="Eliminar servicio"
          mensaje={`¿Seguro que quieres eliminar "${servicioAEliminar.nombreServicio}"? Esta acción no se puede deshacer.`}
          error={errorEliminar}
          confirmando={eliminando}
          onConfirm={confirmarEliminar}
          onCancel={() => setServicioAEliminar(null)}
        />
      )}
    </div>
  )
}
