import { Search, Menu } from 'lucide-react'
import '../styles/layout.css'

export default function TopBar({ onAbrirMenu }) {
  return (
    <header className="topbar">
      <button type="button" className="topbar-menu-btn" onClick={onAbrirMenu} aria-label="Abrir menú">
        <Menu size={22} />
      </button>
      <div className="topbar-search">
        <Search size={18} strokeWidth={2} />
        <input type="text" placeholder="Buscar dueños, mascotas..." />
      </div>
    </header>
  )
}
