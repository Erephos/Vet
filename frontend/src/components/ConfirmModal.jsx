import Modal from './Modal.jsx'
import '../styles/modal.css'

export default function ConfirmModal({ titulo, mensaje, error, confirmando, onConfirm, onCancel }) {
  return (
    <Modal titulo={titulo} onClose={onCancel}>
      <p className="detalle-linea">{mensaje}</p>

      {error && <p className="form-message form-message-error">{error}</p>}

      <div className="confirm-actions">
        <button type="button" className="btn-quick btn-quick-light" onClick={onCancel} disabled={confirmando}>
          Cancelar
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm} disabled={confirmando}>
          {confirmando ? 'Eliminando...' : 'Sí, eliminar'}
        </button>
      </div>
    </Modal>
  )
}
