import { useRef, useState } from 'react'
import { IMPACTO_DESCONOCIDO } from './impacto.js'

// Pide al backend qué más se eliminará junto con un registro. Devuelve [impacto, cargarImpacto]:
// impacto es null mientras se calcula. Si el usuario abre otro registro antes de que llegue la
// respuesta, la respuesta vieja se descarta.
export default function useImpacto(obtenerImpacto) {
  const [impacto, setImpacto] = useState(null)
  const pedidoActual = useRef(0)

  async function cargarImpacto(id) {
    const miPedido = ++pedidoActual.current
    setImpacto(null)

    try {
      const datos = await obtenerImpacto(id)
      if (pedidoActual.current === miPedido) setImpacto(datos)
    } catch (err) {
      console.error('Error calculando qué se eliminará:', err)
      if (pedidoActual.current === miPedido) setImpacto(IMPACTO_DESCONOCIDO)
    }
  }

  return [impacto, cargarImpacto]
}
