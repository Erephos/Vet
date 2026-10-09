import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import DetalleMascotaModal from '../components/DetalleMascotaModal.jsx'
import { obtenerMascotas, crearMascota, actualizarMascota, eliminarMascota } from '../services/mascotasService.js'
import { obtenerDuenos } from '../services/duenosService.js'
import { obtenerRazas } from '../services/catalogosService.js'

const FORM_VACIO = { nombre: '', idDueno: '', idRaza: '', fechaNacimiento: '' }

function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '—'
  const nacimiento = new Date(fechaNacimiento)
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const meses = hoy.getMonth() - nacimiento.getMonth()
  if (meses < 0 || (meses === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return edad <= 0 ? 'Menos de 1 año' : `${edad} año${edad === 1 ? '' : 's'}`
}

export default function Mascotas() {
  const [mascotas, setMascotas] = useState([])
  const [duenos, setDuenos] = useState([])
  const [razas, setRazas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [form, setForm] = useState(FORM_VACIO)

  const [mascotaAEliminar, setMascotaAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

  const [mascotaDetalle, setMascotaDetalle] = useState(null)

  async function cargarDatos() {
    setCargando(true)
    try {
      const [listaMascotas, listaDuenos, listaRazas] = await Promise.all([
        obtenerMascotas(),
        obtenerDuenos(),
        obtenerRazas(),
      ])

      setMascotas(listaMascotas)
      setDuenos(listaDuenos)
      setRazas(listaRazas)
    } catch (err) {
      console.error('Error cargando mascotas:', err)
      setError('No se pudo cargar la información. Verifica que el backend esté encendido.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const mascotasFiltradas = mascotas.filter((m) => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return true
    return (
      m.nombre.toLowerCase().includes(texto) ||
      (m.dueno?.nombre ?? '').toLowerCase().includes(texto) ||
      (m.raza?.nombreRaza ?? '').toLowerCase().includes(texto)
    )
  })

  function abrirModalAgregar() {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setErrorForm('')
    setModalAbierto(true)
  }

  function abrirModalEditar(m, e) {
    e.stopPropagation()
    setEditandoId(m.idMascota)
    setForm({
      nombre: m.nombre,
      idDueno: m.dueno?.idDueno ?? '',
      idRaza: m.raza?.idRaza ?? '',
      fechaNacimiento: m.fechaNacimiento ?? '',
    })
    setErrorForm('')
    setModalAbierto(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrorForm('')

    if (!form.nombre || !form.idDueno || !form.idRaza) {
      setErrorForm('Completa nombre, dueño y raza.')
      return
    }

    const datosMascota = {
      nombre: form.nombre,
      dueno: { idDueno: Number(form.idDueno) },
      raza: { idRaza: Number(form.idRaza) },
      fechaNacimiento: form.fechaNacimiento || null,
    }

    setGuardando(true)
    try {
      const esEdicion = editandoId != null
      if (esEdicion) {
        await actualizarMascota(editandoId, datosMascota)
      } else {
        await crearMascota(datosMascota)
      }

      setModalAbierto(false)
      await cargarDatos()
    } catch (err) {
      console.error('Error guardando mascota:', err)
      setErrorForm('No se pudo guardar la mascota. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  function pedirEliminar(m, e) {
    e.stopPropagation()
    setErrorEliminar('')
    setMascotaAEliminar(m)
  }

  async function confirmarEliminar() {
    setEliminando(true)
    setErrorEliminar('')
    try {
      await eliminarMascota(mascotaAEliminar.idMascota)

      setMascotaAEliminar(null)
      await cargarDatos()
    } catch (err) {
      console.error('Error eliminando mascota:', err)
      setErrorEliminar('No se pudo eliminar. Si esta mascota tiene consultas registradas, primero elimínalas.')
    } finally {
      setEliminando(false)
    }
  }

  function iniciales(nombre) {
    return nombre.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
  }

  return (
    <div className="page-duenos">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Mascotas</h1>
          <p className="page-subtitle">{cargando ? '…' : `${mascotas.length} registros`}</p>
        </div>
        <button type="button" className="btn-submit btn-inline" onClick={abrirModalAgregar}>
          <Plus size={16} /> Agregar mascota
        </button>
      </div>

      <div className="table-search">
        <input
          type="text"
          placeholder="Buscar por nombre, dueño o raza..."
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
              <th>Raza</th>
              <th>Dueño</th>
              <th>Edad</th>
              <th aria-hidden="true"></th>
            </tr>
          </thead>
          <tbody>
            {cargando && (
              <tr><td colSpan={5} className="empty-hint">Cargando…</td></tr>
            )}

            {!cargando && mascotasFiltradas.length === 0 && (
              <tr><td colSpan={5} className="empty-hint">No se encontraron mascotas.</td></tr>
            )}

            {mascotasFiltradas.map((m) => (
              <tr key={m.idMascota} className="data-row data-row-clickable" onClick={() => setMascotaDetalle(m)}>
                <td>
                  <div className="row-person">
                    <span className="row-avatar">{iniciales(m.nombre)}</span>
                    <span>{m.nombre}</span>
                  </div>
                </td>
                <td>{m.raza?.nombreRaza || '—'}</td>
                <td>{m.dueno?.nombre || '—'}</td>
                <td>{calcularEdad(m.fechaNacimiento)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="icon-btn" onClick={(e) => abrirModalEditar(m, e)} aria-label="Editar">
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="icon-btn icon-btn-danger" onClick={(e) => pedirEliminar(m, e)} aria-label="Eliminar">
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
        <Modal titulo={editandoId != null ? 'Editar mascota' : 'Agregar mascota'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="nombreMascota">Nombre</label>
              <input
                id="nombreMascota"
                className="form-control"
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueno">Dueño</label>
              <select
                id="dueno"
                className="form-control"
                value={form.idDueno}
                onChange={(e) => setForm({ ...form, idDueno: e.target.value })}
                required
              >
                <option value="" disabled>Selecciona un dueño</option>
                {duenos.map((d) => (
                  <option key={d.idDueno} value={d.idDueno}>{d.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="raza">Raza</label>
              <select
                id="raza"
                className="form-control"
                value={form.idRaza}
                onChange={(e) => setForm({ ...form, idRaza: e.target.value })}
                required
              >
                <option value="" disabled>Selecciona una raza</option>
                {razas.map((r) => (
                  <option key={r.idRaza} value={r.idRaza}>
                    {r.nombreRaza}{r.especie?.nombreEspecie ? ` (${r.especie.nombreEspecie})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fechaNacimiento">Fecha de nacimiento (opcional)</label>
              <input
                id="fechaNacimiento"
                className="form-control"
                type="date"
                value={form.fechaNacimiento}
                onChange={(e) => setForm({ ...form, fechaNacimiento: e.target.value })}
              />
            </div>

            {errorForm && <p className="form-message form-message-error">{errorForm}</p>}

            <button type="submit" className="btn-submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId != null ? 'Guardar cambios' : 'Guardar mascota'}
            </button>
          </form>
        </Modal>
      )}

      {mascotaAEliminar && (
        <ConfirmModal
          titulo="Eliminar mascota"
          mensaje={`¿Seguro que quieres eliminar a "${mascotaAEliminar.nombre}"? Esta acción no se puede deshacer.`}
          error={errorEliminar}
          confirmando={eliminando}
          onConfirm={confirmarEliminar}
          onCancel={() => setMascotaAEliminar(null)}
        />
      )}

      {mascotaDetalle && (
        <DetalleMascotaModal mascota={mascotaDetalle} onClose={() => setMascotaDetalle(null)} />
      )}
    </div>
  )
}
