import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'

export default function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const location = useLocation()

  // Cierra el menú al cambiar de página
  useEffect(() => {
    setMenuAbierto(false)
  }, [location.pathname])

  return (
    <div className="app-shell">
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />
      {menuAbierto && <div className="sidebar-backdrop" onClick={() => setMenuAbierto(false)} />}
      <div className="app-shell-main">
        <TopBar onAbrirMenu={() => setMenuAbierto(true)} />
        <main className="app-shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
