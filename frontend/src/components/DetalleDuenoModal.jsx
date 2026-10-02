import { PawPrint } from 'lucide-react'
import Modal from './Modal.jsx'

export default function DetalleDuenoModal({ dueno, mascotas, onClose }) {
  const mascotasDelDueno = mascotas.filter((m) => m.dueno?.idDueno === dueno.idDueno)

  return (
    <Modal titulo={dueno.nombre} onClose={onClose}>
      <p className="detalle-linea"><strong>Teléfono:</strong> {dueno.telefono || '—'}</p>
      <p className="detalle-linea"><strong>Dirección:</strong> {dueno.direccion || '—'}</p>

      <h3 className="detalle-subtitulo">Mascotas</h3>

      {mascotasDelDueno.length === 0 ? (
        <p className="empty-hint">Este dueño todavía no tiene mascotas registradas.</p>
      ) : (
        <ul className="today-list">
          {mascotasDelDueno.map((m) => (
            <li key={m.idMascota} className="today-item">
              <span className="today-item-icon"><PawPrint size={16} /></span>
              <div>
                <div className="today-item-title">{m.nombre}</div>
                <div className="today-item-sub">{m.raza?.nombreRaza || 'Raza sin registrar'}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
