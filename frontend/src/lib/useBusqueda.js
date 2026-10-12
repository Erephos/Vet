import { useEffect, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

// Estado del buscador de un listado. Si llegas con ?buscar=... en la dirección
// (por ejemplo desde la barra superior), el buscador aparece ya relleno.
export default function useBusqueda() {
  const [params] = useSearchParams()
  const location = useLocation()
  const desdeUrl = params.get('buscar') ?? ''
  const [busqueda, setBusqueda] = useState(desdeUrl)

  // location.key cambia en cada navegación, así que elegir otro resultado vuelve a rellenar el buscador.
  useEffect(() => {
    setBusqueda(desdeUrl)
  }, [desdeUrl, location.key])

  return [busqueda, setBusqueda]
}
