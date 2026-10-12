import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Menu } from 'lucide-react'
import { obtenerDatosBusqueda } from '../services/busquedaService.js'
import { buscarEnTodo, normalizarBusqueda } from '../lib/busqueda.js'
import '../styles/layout.css'

// Los datos se piden al enfocar la barra y se reutilizan este tiempo, para no consultar en cada tecla.
const VIGENCIA_DATOS_MS = 30000

export default function TopBar({ onAbrirMenu }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const ultimaCarga = useRef(0)

  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function cargarDatos() {
    if (datos && Date.now() - ultimaCarga.current < VIGENCIA_DATOS_MS) return
    setCargando(true)
    setError('')
    try {
      setDatos(await obtenerDatosBusqueda())
      ultimaCarga.current = Date.now()
    } catch (err) {
      console.error('Error cargando datos de búsqueda:', err)
      setError('No se pudo cargar la búsqueda. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  const grupos = useMemo(() => (datos ? buscarEnTodo(datos, texto) : []), [datos, texto])
  const hayTexto = normalizarBusqueda(texto) !== ''

  function cerrar() {
    setTexto('')
    setAbierto(false)
    inputRef.current?.blur()
  }

  // Un resultado concreto: abre el listado con el buscador en "#ID", que deja solo ese registro.
  function elegirResultado(g, item) {
    navigate(`${g.ruta}?buscar=${encodeURIComponent(`#${item.id}`)}`)
    cerrar()
  }

  // "Ver todos": abre el listado con lo mismo que escribiste.
  function verTodos(g) {
    navigate(`${g.ruta}?buscar=${encodeURIComponent(texto.trim())}`)
    cerrar()
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      cerrar()
    } else if (e.key === 'Enter' && grupos.length > 0) {
      e.preventDefault()
      elegirResultado(grupos[0], grupos[0].items[0])
    }
  }

  return (
    <header className="topbar">
      <button type="button" className="topbar-menu-btn" onClick={onAbrirMenu} aria-label="Abrir menú">
        <Menu size={22} />
      </button>

      <div className="topbar-search">
        <Search size={18} strokeWidth={2} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar por nombre o ID..."
          value={texto}
          onChange={(e) => { setTexto(e.target.value); setAbierto(true) }}
          onFocus={() => { setAbierto(true); cargarDatos() }}
          onBlur={() => setAbierto(false)}
          onKeyDown={onKeyDown}
          aria-label="Buscar en todo el sistema"
        />

        {abierto && hayTexto && (
          // mouseDown con preventDefault evita que el input pierda el foco antes de registrar el clic
          <div className="search-results" onMouseDown={(e) => e.preventDefault()}>
            {cargando && <p className="search-empty">Buscando…</p>}
            {!cargando && error && <p className="search-empty">{error}</p>}
            {!cargando && !error && grupos.length === 0 && (
              <p className="search-empty">Sin resultados para &quot;{texto.trim()}&quot;.</p>
            )}

            {!cargando && !error && grupos.map((g) => (
              <div key={g.clave}>
                <p className="search-group">{g.titulo}</p>
                {g.items.map((item) => (
                  <button
                    type="button"
                    key={`${g.clave}-${item.id}`}
                    className="search-item"
                    onClick={() => elegirResultado(g, item)}
                  >
                    <span className="search-item-id">#{item.id}</span>
                    <span className="search-item-title">{item.titulo}</span>
                    <span className="search-item-sub">{item.detalle}</span>
                  </button>
                ))}
                {g.total > g.items.length && (
                  <button type="button" className="search-more" onClick={() => verTodos(g)}>
                    Ver los {g.total} resultados en {g.titulo}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
