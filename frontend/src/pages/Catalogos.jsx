import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Modal from '../components/Modal.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export default function Catalogos() {
  const [pestana, setPestana] = useState('razas')

  const [especies, setEspecies] = useState([])
  const [razas, setRazas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalAbierto, setModalAbierto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [errorForm, setErrorForm] = useState('')
  const [formRaza, setFormRaza] = useState({ nombreRaza: '', idEspecie: '' })
  const [formEspecie, setFormEspecie] = useState({ nombreEspecie: '' })

  const [itemAEliminar, setItemAEliminar] = useState(null) // { tipo: 'raza'|'especie', item }
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState('')

  async function cargarDatos() {
    setCargando(true)
    try {
      const [resEspecies, resRazas] = await Promise.all([
        fetch(`${API_BASE}/especies`),
        fetch(`${API_BASE}/razas`),
      ])

      if (!resEspecies.ok || !resRazas.ok) throw new Error('Alguno de los endpoints no respondió OK')

      setEspecies(await resEspecies.json())
      setRazas(await resRazas.json())
    } catch (err) {
      console.error('Error cargando catálogos:', err)
      setError('No se pudo cargar la información. Verifica que el backend esté encendido.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  function abrirModalAgregar() {
    setEditandoId(null)
    setFormRaza({ nombreRaza: '', idEspecie: '' })
    setFormEspecie({ nombreEspecie: '' })
    setErrorForm('')
    setModalAbierto(true)
  }

  function abrirModalEditar(item) {
    setEditandoId(pestana === 'razas' ? item.idRaza : item.idEspecie)
    if (pestana === 'razas') {
      setFormRaza({ nombreRaza: item.nombreRaza, idEspecie: item.especie?.idEspecie ?? '' })
    } else {
      setFormEspecie({ nombreEspecie: item.nombreEspecie })
    }
    setErrorForm('')
    setModalAbierto(true)
  }

  async function handleSubmitRaza(e) {
    e.preventDefault()
    setErrorForm('')

    if (!formRaza.nombreRaza.trim() || !formRaza.idEspecie) {
      setErrorForm('Completa el nombre y la especie.')
      return
    }

    setGuardando(true)
    try {
      const esEdicion = editandoId != null
      const url = esEdicion ? `${API_BASE}/razas/${editandoId}` : `${API_BASE}/razas`
      const res = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreRaza: formRaza.nombreRaza,
          especie: { idEspecie: Number(formRaza.idEspecie) },
        }),
      })

      if (!res.ok) throw new Error('El backend respondió con error')

      setModalAbierto(false)
      await cargarDatos()
    } catch (err) {
      console.error('Error guardando raza:', err)
      setErrorForm('No se pudo guardar la raza. Revisa los datos e inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  async function handleSubmitEspecie(e) {
    e.preventDefault()
    setErrorForm('')

    if (!formEspecie.nombreEspecie.trim()) {
      setErrorForm('El nombre es obligatorio.')
      return
    }

    setGuardando(true)
    try {
      const esEdicion = editandoId != null
      const url = esEdicion ? `${API_BASE}/especies/${editandoId}` : `${API_BASE}/especies`
      const res = await fetch(url, {
        method: esEdicion ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreEspecie: formEspecie.nombreEspecie }),
      })

      if (!res.ok) throw new Error('El backend respondió con error')

      setModalAbierto(false)
      await cargarDatos()
    } catch (err) {
      console.error('Error guardando especie:', err)
      setErrorForm('No se pudo guardar la especie. Puede que ya exista una con ese nombre.')
    } finally {
      setGuardando(false)
    }
  }

  async function confirmarEliminar() {
    setEliminando(true)
    setErrorEliminar('')
    try {
      const { tipo, item } = itemAEliminar
      const url = tipo === 'raza' ? `${API_BASE}/razas/${item.idRaza}` : `${API_BASE}/especies/${item.idEspecie}`
      const res = await fetch(url, { method: 'DELETE' })
      if (!res.ok) throw new Error('El backend respondió con error al eliminar')

      setItemAEliminar(null)
      await cargarDatos()
    } catch (err) {
      console.error('Error eliminando:', err)
      setErrorEliminar(
        itemAEliminar.tipo === 'raza'
          ? 'No se pudo eliminar. Si esta raza ya tiene mascotas registradas, primero cámbialas de raza.'
          : 'No se pudo eliminar. Si esta especie tiene razas registradas, primero elimínalas.',
      )
    } finally {
      setEliminando(false)
    }
  }

  return (
    <div className="page-duenos">
      <div className="page-title-row">
        <div>
          <h1 className="page-title">Catálogos</h1>
          <p className="page-subtitle">Razas y especies usadas al registrar mascotas</p>
        </div>
        <button type="button" className="btn-submit btn-inline" onClick={abrirModalAgregar}>
          <Plus size={16} /> Agregar {pestana === 'razas' ? 'raza' : 'especie'}
        </button>
      </div>

      <div className="tabs">
        <button
          type="button"
          className={`tab-btn${pestana === 'razas' ? ' tab-btn-active' : ''}`}
          onClick={() => setPestana('razas')}
        >
          Razas
        </button>
        <button
          type="button"
          className={`tab-btn${pestana === 'especies' ? ' tab-btn-active' : ''}`}
          onClick={() => setPestana('especies')}
        >
          Especies
        </button>
      </div>

      {error && <p className="form-message form-message-error">{error}</p>}

      <div className="panel panel-table">
        {pestana === 'razas' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Raza</th>
                <th>Especie</th>
                <th aria-hidden="true"></th>
              </tr>
            </thead>
            <tbody>
              {cargando && <tr><td colSpan={3} className="empty-hint">Cargando…</td></tr>}
              {!cargando && razas.length === 0 && (
                <tr><td colSpan={3} className="empty-hint">No hay razas registradas.</td></tr>
              )}
              {razas.map((r) => (
                <tr key={r.idRaza} className="data-row">
                  <td>{r.nombreRaza}</td>
                  <td>{r.especie?.nombreEspecie || '—'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => abrirModalEditar(r)} aria-label="Editar">
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        onClick={() => { setErrorEliminar(''); setItemAEliminar({ tipo: 'raza', item: r }) }}
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Especie</th>
                <th aria-hidden="true"></th>
              </tr>
            </thead>
            <tbody>
              {cargando && <tr><td colSpan={2} className="empty-hint">Cargando…</td></tr>}
              {!cargando && especies.length === 0 && (
                <tr><td colSpan={2} className="empty-hint">No hay especies registradas.</td></tr>
              )}
              {especies.map((esp) => (
                <tr key={esp.idEspecie} className="data-row">
                  <td>{esp.nombreEspecie}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => abrirModalEditar(esp)} aria-label="Editar">
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn icon-btn-danger"
                        onClick={() => { setErrorEliminar(''); setItemAEliminar({ tipo: 'especie', item: esp }) }}
                        aria-label="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && pestana === 'razas' && (
        <Modal titulo={editandoId != null ? 'Editar raza' : 'Agregar raza'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmitRaza} className="modal-form">
            <div className="form-group">
              <label htmlFor="nombreRaza">Nombre de la raza</label>
              <input
                id="nombreRaza"
                className="form-control"
                type="text"
                value={formRaza.nombreRaza}
                onChange={(e) => setFormRaza({ ...formRaza, nombreRaza: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="especieRaza">Especie</label>
              <select
                id="especieRaza"
                className="form-control"
                value={formRaza.idEspecie}
                onChange={(e) => setFormRaza({ ...formRaza, idEspecie: e.target.value })}
                required
              >
                <option value="" disabled>Selecciona una especie</option>
                {especies.map((esp) => (
                  <option key={esp.idEspecie} value={esp.idEspecie}>{esp.nombreEspecie}</option>
                ))}
              </select>
              {especies.length === 0 && (
                <p className="empty-hint">Primero crea una especie en la otra pestaña.</p>
              )}
            </div>

            {errorForm && <p className="form-message form-message-error">{errorForm}</p>}

            <button type="submit" className="btn-submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId != null ? 'Guardar cambios' : 'Guardar raza'}
            </button>
          </form>
        </Modal>
      )}

      {modalAbierto && pestana === 'especies' && (
        <Modal titulo={editandoId != null ? 'Editar especie' : 'Agregar especie'} onClose={() => setModalAbierto(false)}>
          <form onSubmit={handleSubmitEspecie} className="modal-form">
            <div className="form-group">
              <label htmlFor="nombreEspecie">Nombre de la especie</label>
              <input
                id="nombreEspecie"
                className="form-control"
                type="text"
                value={formEspecie.nombreEspecie}
                onChange={(e) => setFormEspecie({ nombreEspecie: e.target.value })}
                required
              />
            </div>

            {errorForm && <p className="form-message form-message-error">{errorForm}</p>}

            <button type="submit" className="btn-submit" disabled={guardando}>
              {guardando ? 'Guardando...' : editandoId != null ? 'Guardar cambios' : 'Guardar especie'}
            </button>
          </form>
        </Modal>
      )}

      {itemAEliminar && (
        <ConfirmModal
          titulo={itemAEliminar.tipo === 'raza' ? 'Eliminar raza' : 'Eliminar especie'}
          mensaje={`¿Seguro que quieres eliminar "${itemAEliminar.tipo === 'raza' ? itemAEliminar.item.nombreRaza : itemAEliminar.item.nombreEspecie}"? Esta acción no se puede deshacer.`}
          error={errorEliminar}
          confirmando={eliminando}
          onConfirm={confirmarEliminar}
          onCancel={() => setItemAEliminar(null)}
        />
      )}
    </div>
  )
}
