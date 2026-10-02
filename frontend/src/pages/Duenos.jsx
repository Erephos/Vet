import { useEffect, useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import DetalleDuenoModal from '../components/DetalleDuenoModal.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const FORM_VACIO = { nombre: '', telefono: '', direccion: '' }

export default function Duenos() {
  const [duenos, setDuenos] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Alta / edición comparten el mismo modal: si hay idDueno, es edición (PUT)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [form, setForm] = useState(FORM_VACIO)

  const [duenoAEliminar, setDuenoAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

  const [duenoDetalle, setDuenoDetalle] = useState(null)

  async function cargarDatos() {
    setCargando(true)
    try {
      const [resDuenos, resMascotas] = await Promise.all([
        fetch(`${API_BASE}/duenos`),
        fetch(`${API_BASE}/mascotas`),
      ])

      if (!resDuenos.ok || !resMascotas.ok) {
        throw new Error('Alguno de los endpoints no respondió OK')
      }

      setDuenos(await resDuenos.json())
      setMascotas(await resMascotas.json())
    } catch (err) {
      console.error('Error cargando dueños:', err)
      setError('No se pudo cargar la lista de dueños. Verifica que el backend esté encendido.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const cantidadMascotasPorDueno = useMemo(() => {
    const conteo = {}
    for (const m of mascotas) {
      const id = m.dueno?.idDueno
      if (id != null) conteo[id] = (conteo[id] ?? 0) + 1
    }
    return conteo
  }, [mascotas])

  const duenosFiltrados = duenos.filter((d) => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return true
    return (
      d.nombre.toLowerCase().includes(texto) ||
      (d.telefono ?? '').toLowerCase().includes(texto)
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

  function abrirModalEditar(d, e) {
    e.stopPropagation()
    setEditandoId(d.idDueno)
    setForm({ nombre: d.nombre, telefono: d.telefono ?? '', direccion: d.direccion ?? '' })
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
      const url = esEdicion ? `${API_BASE}/duenos/${editandoId}` : `${API_BASE}/duenos`
      const response = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) throw new Error('El backend respondió con error')

      setModalAbierto(false)
      await cargarDatos()
    } catch (err) {
      console.error('Error guardando dueño:', err)
      setErrorForm('No se pudo guardar el dueño. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  function pedirEliminar(d, e) {
    e.stopPropagation()
    setErrorEliminar('')
    setDuenoAEliminar(d)
  }

  async function confirmarEliminar() {
    setEliminando(true)
    setErrorEliminar('')
    try {
      const res = await fetch(`${API_BASE}/duenos/${duenoAEliminar.idDueno}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('El backend respondió con error al eliminar')

      setDuenoAEliminar(null)
      await cargarDatos()
    } catch (err) {
      console.error('Error eliminando dueño:', err)
      setErrorEliminar('No se pudo eliminar. Si este dueño tiene mascotas registradas, primero elimínalas o cámbialas de dueño.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="page-duenos">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Dueños</h1>
          <p className="page-subtitle">{cargando ? '…' : `${duenos.length} registros`}</p>
        </div>
        <button type="button" className="btn-submit btn-inline" onClick={abrirModalAgregar}>
          <Plus size={16} /> Agregar dueño
        </button>
      </div>

      <div className="table-search">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono..."
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
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Mascotas</th>
              <th aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr><td colSpan={5} className="empty-hint">Cargando…</td></tr>
            )}

            {!cargando && duenosFiltrados.length === 0 && (
              <tr><td colSpan={5} className="empty-hint">No se encontraron dueños.</td></tr>
            )}

            {duenosFiltrados.map((d) => (
              <tr key={d.idDueno} className="data-row data-row-clickable" onClick={() => setDuenoDetalle(d)}>
                <td>
                  <div className="row-person">
                    <span className="row-avatar">{iniciales(d.nombre)}</span>
                    <span>{d.nombre}</span>
                  </div>
                </td>
                <td>{d.telefono || '—'}</td>
                <td>{d.direccion || '—'}</td>
                <td>
                  <span className="badge-count">{cantidadMascotasPorDueno[d.idDueno] ?? 0}</span>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="icon-btn" onClick={(e) => abrirModalEditar(d, e)} aria-label="Editar">
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={(e) => pedirEliminar(d, e)} aria-label="Eliminar">
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
        <Modal titulo={editandoId != null ? 'Editar dueño' : 'Agregar dueño'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="nombreDueno">Nombre</label>
              <input
                id="nombreDueno"
                className="form-control"
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefonoDueno">Teléfono (opcional)</label>
              <input
                id="telefonoDueno"
                className="form-control"
                type="text"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="direccionDueno">Dirección (opcional)</label>
              <input
                id="direccionDueno"
                className="form-control"
                type="text"
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              />
            </div>

            {errorForm && <p className="form-message form-message-error">{errorForm}</p>}

            <button type="submit" className="btn-submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId != null ? 'Guardar cambios' : 'Guardar dueño'}
            </button>
          </form>
        </Modal>
      )}

      {duenoAEliminar && (
        <ConfirmModal
          titulo="Eliminar dueño"
          mensaje={`¿Seguro que quieres eliminar a "${duenoAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          error={errorEliminar}
          confirmando={eliminando}
          onConfirm={confirmarEliminar}
          onCancel={() => setDuenoAEliminar(null)}
        />
      )}

      {duenoDetalle && (
        <DetalleDuenoModal dueno={duenoDetalle} mascotas={mascotas} onClose={() => setDuenoDetalle(null)} />
      )}
    </div>
  )
}
