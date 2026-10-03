import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import DetalleConsultaModal from '../components/DetalleConsultaModal.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const FORM_VACIO = { idMascota: '', idVeterinario: '', fechaHora: '', diagnostico: '', costoBase: '' }

function formatearFechaHora(fechaHoraStr) {
  if (!fechaHoraStr) return '—'
  const fecha = new Date(fechaHoraStr)
  return fecha.toLocaleString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// El backend espera LocalDateTime tipo "2026-09-25T14:30:00"; el input
// datetime-local ya entrega ese formato salvo por los segundos.
function aLocalDateTime(valorInput) {
  return valorInput ? `${valorInput}:00` : null
}

// Para precargar el input datetime-local al editar (quita segundos/zona)
function aInputDatetimeLocal(fechaHoraStr) {
  if (!fechaHoraStr) return ''
  return fechaHoraStr.slice(0, 16)
}

export default function Consultas() {
  const [consultas, setConsultas] = useState([])
  const [mascotas, setMascotas] = useState([])
  const [veterinarios, setVeterinarios] = useState([])
  const [servicios, setServicios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [form, setForm] = useState(FORM_VACIO)

  const [consultaAEliminar, setConsultaAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

  const [consultaSeleccionada, setConsultaSeleccionada] = useState(null)

  async function cargarDatos() {
    setCargando(true)
    try {
      const [resConsultas, resMascotas, resVeterinarios, resServicios] = await Promise.all([
        fetch(`${API_BASE}/consultas`),
        fetch(`${API_BASE}/mascotas`),
        fetch(`${API_BASE}/veterinarios`),
        fetch(`${API_BASE}/servicios`),
      ])

      if (!resConsultas.ok || !resMascotas.ok || !resVeterinarios.ok || !resServicios.ok) {
        throw new Error('Alguno de los endpoints no respondió OK')
      }

      setConsultas(await resConsultas.json())
      setMascotas(await resMascotas.json())
      setVeterinarios(await resVeterinarios.json())
      setServicios(await resServicios.json())
    } catch (err) {
      console.error('Error cargando consultas:', err)
      setError('No se pudo cargar la información. Verifica que el backend esté encendido.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const consultasFiltradas = consultas.filter((c) => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return true
    return (
      (c.mascota?.nombre ?? '').toLowerCase().includes(texto) ||
      (c.veterinario?.nombre ?? '').toLowerCase().includes(texto) ||
      (c.diagnostico ?? '').toLowerCase().includes(texto)
    )
  })

  function abrirModalAgregar() {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setErrorForm('')
    setModalAbierto(true)
  }

  function abrirModalEditar(c, e) {
    e.stopPropagation()
    setEditandoId(c.idConsulta)
    setForm({
      idMascota: c.mascota?.idMascota ?? '',
      idVeterinario: c.veterinario?.idVeterinario ?? '',
      fechaHora: aInputDatetimeLocal(c.fechaHora),
      diagnostico: c.diagnostico ?? '',
      costoBase: String(c.costoBase ?? ''),
    })
    setErrorForm('')
    setModalAbierto(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorForm('')

    if (!form.idMascota || !form.idVeterinario || !form.fechaHora) {
      setErrorForm('Selecciona mascota, veterinario y la fecha/hora de la consulta.')
      return
    }

    const datosConsulta = {
      mascota: { idMascota: Number(form.idMascota) },
      veterinario: { idVeterinario: Number(form.idVeterinario) },
      fechaHora: aLocalDateTime(form.fechaHora),
      diagnostico: form.diagnostico || null,
      costoBase: form.costoBase ? Number(form.costoBase) : 0,
    }

    setGuardando(true)
    try {
      const esEdicion = editandoId != null
      const url = esEdicion ? `${API_BASE}/consultas/${editandoId}` : `${API_BASE}/consultas`
      const response = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosConsulta),
      })

      if (!response.ok) throw new Error('El backend respondió con error')

      setModalAbierto(false)
      await cargarDatos()
    } catch (err) {
      console.error('Error guardando consulta:', err)
      setErrorForm('No se pudo guardar la consulta. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  function pedirEliminar(c, e) {
    e.stopPropagation()
    setErrorEliminar('')
    setConsultaAEliminar(c)
  }

  async function confirmarEliminar() {
    setEliminando(true)
    setErrorEliminar('')
    try {
      const res = await fetch(`${API_BASE}/consultas/${consultaAEliminar.idConsulta}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('El backend respondió con error al eliminar')

      setConsultaAEliminar(null)
      await cargarDatos()
    } catch (err) {
      console.error('Error eliminando consulta:', err)
      setErrorEliminar('No se pudo eliminar. Si esta consulta tiene servicios aplicados, primero quítalos desde su detalle.')
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="page-duenos">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Consultas</h1>
          <p className="page-subtitle">{cargando ? '…' : `${consultas.length} registros`}</p>
        </div>
        <button type="button" className="btn-submit btn-inline" onClick={abrirModalAgregar}>
          <Plus size={16} /> Agregar consulta
        </button>
      </div>

      <div className="table-search">
        <input
          type="text"
          placeholder="Buscar por mascota, veterinario o diagnóstico..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <p className="form-message form-message-error">{error}</p>}

      <div className="panel panel-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Mascota</th>
              <th>Veterinario</th>
              <th>Costo base</th>
              <th aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr><td colSpan={5} className="empty-hint">Cargando…</td></tr>
            )}

            {!cargando && consultasFiltradas.length === 0 && (
              <tr><td colSpan={5} className="empty-hint">No se encontraron consultas.</td></tr>
            )}

            {consultasFiltradas.map((c) => (
              <tr
                key={c.idConsulta}
                className="data-row data-row-clickable"
                onClick={() => setConsultaSeleccionada(c)}
              >
                <td>{formatearFechaHora(c.fechaHora)}</td>
                <td>{c.mascota?.nombre || '—'}</td>
                <td>{c.veterinario?.nombre || '—'}</td>
                <td>S/ {Number(c.costoBase ?? 0).toFixed(2)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="icon-btn" onClick={(e) => abrirModalEditar(c, e)} aria-label="Editar">
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={(e) => pedirEliminar(c, e)} aria-label="Eliminar">
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
        <Modal titulo={editandoId != null ? 'Editar consulta' : 'Agregar consulta'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="mascotaConsulta">Mascota</label>
              <select
                id="mascotaConsulta"
                className="form-control"
                value={form.idMascota}
                onChange={(e) => setForm({ ...form, idMascota: e.target.value })}
                required
              >
                <option value="" disabled>Selecciona una mascota</option>
                {mascotas.map((m) => (
                  <option key={m.idMascota} value={m.idMascota}>
                    {m.nombre} ({m.dueno?.nombre ?? 'sin dueño'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="veterinarioConsulta">Veterinario</label>
              <select
                id="veterinarioConsulta"
                className="form-control"
                value={form.idVeterinario}
                onChange={(e) => setForm({ ...form, idVeterinario: e.target.value })}
                required
              >
                <option value="" disabled>Selecciona un veterinario</option>
                {veterinarios.map((v) => (
                  <option key={v.idVeterinario} value={v.idVeterinario}>{v.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fechaHoraConsulta">Fecha y hora</label>
              <input
                id="fechaHoraConsulta"
                className="form-control"
                type="datetime-local"
                value={form.fechaHora}
                onChange={(e) => setForm({ ...form, fechaHora: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="diagnosticoConsulta">Diagnóstico (opcional)</label>
              <textarea
                id="diagnosticoConsulta"
                className="form-control"
                rows={3}
                value={form.diagnostico}
                onChange={(e) => setForm({ ...form, diagnostico: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="costoBaseConsulta">Costo base (S/)</label>
              <input
                id="costoBaseConsulta"
                className="form-control"
                type="number"
                min="0"
                step="0.01"
                value={form.costoBase}
                onChange={(e) => setForm({ ...form, costoBase: e.target.value })}
              />
            </div>

            {errorForm && <p className="form-message form-message-error">{errorForm}</p>}

            <button type="submit" className="btn-submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId != null ? 'Guardar cambios' : 'Guardar consulta'}
            </button>
          </form>
        </Modal>
      )}

      {consultaAEliminar && (
        <ConfirmModal
          titulo="Eliminar consulta"
          mensaje={`¿Seguro que quieres eliminar la consulta de "${consultaAEliminar.mascota?.nombre ?? 'esta mascota'}"? Esta acción no se puede deshacer.`}
          error={errorEliminar}
          confirmando={eliminando}
          onConfirm={confirmarEliminar}
          onCancel={() => setConsultaAEliminar(null)}
        />
      )}

      {consultaSeleccionada && (
        <DetalleConsultaModal
          consulta={consultaSeleccionada}
          servicios={servicios}
          onClose={() => setConsultaSeleccionada(null)}
          onCambio={cargarDatos}
        />
      )}
    </div>
  )
}
