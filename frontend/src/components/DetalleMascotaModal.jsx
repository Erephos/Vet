import { useEffect, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import Modal from './Modal.jsx'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

function formatearFecha(fechaHoraStr) {
  if (!fechaHoraStr) return 'Sin fecha'
  return new Date(fechaHoraStr).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function DetalleMascotaModal({ mascota, onClose }) {
  const [consultas, setConsultas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const res = await fetch(`${API_BASE}/consultas/mascota/${mascota.idMascota}`)
        if (!res.ok) throw new Error('Respuesta no OK')
        setConsultas(await res.json())
      } catch (err) {
        console.error('Error cargando historial de la mascota:', err)
        setError('No se pudo cargar el historial de consultas.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [mascota.idMascota])

  return (
    <Modal titulo={mascota.nombre} onClose={onClose}>
      <p className="detalle-linea"><strong>Dueño:</strong> {mascota.dueno?.nombre || '—'}</p>
      <p className="detalle-linea"><strong>Raza:</strong> {mascota.raza?.nombreRaza || '—'}</p>

      <h3 className="detalle-subtitulo">Historial de consultas</h3>

      {error && <p className="form-message form-message-error">{error}</p>}

      {cargando ? (
        <p className="empty-hint">Cargando…</p>
      ) : consultas.length === 0 ? (
        <p className="empty-hint">Esta mascota todavía no tiene consultas registradas.</p>
      ) : (
        <ul className="today-list">
          {consultas.map((c) => (
            <li key={c.idConsulta} className="today-item">
              <span className="today-item-icon"><ClipboardList size={16} /></span>
              <div>
                <div className="today-item-title">
                  {formatearFecha(c.fechaHora)} — {c.veterinario?.nombre || 'Sin veterinario'}
                </div>
                <div className="today-item-sub">{c.diagnostico || 'Sin diagnóstico registrado'}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
