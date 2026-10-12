// Lógica de búsqueda compartida por los listados y por la barra superior.

// Lo que escribió la persona, sin espacios, en minúsculas y sin el "#" opcional que se usa para los ID.
export function normalizarBusqueda(texto) {
  return String(texto ?? '').trim().toLowerCase().replace(/^#/, '')
}

// ¿El registro coincide con lo escrito?
//  - Un número exacto coincide con el ID ("7" o "#7").
//  - Si son 1 o 2 dígitos se interpreta SOLO como ID, para no mezclarlo con teléfonos u otros números.
//  - Cualquier otro texto se busca dentro de los campos indicados.
export function coincideBusqueda(texto, id, campos = []) {
  const t = normalizarBusqueda(texto)
  if (t === '') return true
  if (String(id) === t) return true
  if (/^\d{1,2}$/.test(t)) return false
  return campos.some((campo) => String(campo ?? '').toLowerCase().includes(t))
}

const MAX_POR_GRUPO = 4

function grupo(clave, titulo, ruta, lista, texto, idDe, camposDe, itemDe) {
  const coincidencias = lista.filter((x) => coincideBusqueda(texto, idDe(x), camposDe(x)))
  return {
    clave,
    titulo,
    ruta,
    total: coincidencias.length,
    items: coincidencias.slice(0, MAX_POR_GRUPO).map((x) => ({ id: idDe(x), ...itemDe(x) })),
  }
}

// Busca en todos los listados a la vez (barra superior). Devuelve solo los grupos con resultados.
export function buscarEnTodo(datos, texto) {
  if (normalizarBusqueda(texto) === '') return []

  const grupos = [
    grupo('duenos', 'Dueños', '/duenos', datos.duenos ?? [], texto,
      (d) => d.idDueno,
      (d) => [d.nombre, d.telefono],
      (d) => ({ titulo: d.nombre, detalle: d.telefono || 'Sin teléfono' })),

    grupo('mascotas', 'Mascotas', '/mascotas', datos.mascotas ?? [], texto,
      (m) => m.idMascota,
      (m) => [m.nombre, m.dueno?.nombre, m.raza?.nombreRaza],
      (m) => ({ titulo: m.nombre, detalle: [m.raza?.nombreRaza, m.dueno?.nombre].filter(Boolean).join(' · ') })),

    grupo('consultas', 'Consultas', '/consultas', datos.consultas ?? [], texto,
      (c) => c.idConsulta,
      (c) => [c.mascota?.nombre, c.veterinario?.nombre, c.diagnostico],
      (c) => ({
        titulo: c.mascota?.nombre ?? 'Consulta',
        detalle: [(c.fechaHora ?? '').slice(0, 10), c.veterinario?.nombre].filter(Boolean).join(' · '),
      })),

    grupo('veterinarios', 'Veterinarios', '/veterinarios', datos.veterinarios ?? [], texto,
      (v) => v.idVeterinario,
      (v) => [v.nombre, v.especialidad, v.telefono],
      (v) => ({ titulo: v.nombre, detalle: v.especialidad || 'Sin especialidad' })),

    grupo('servicios', 'Servicios', '/servicios', datos.servicios ?? [], texto,
      (s) => s.idServicio,
      (s) => [s.nombreServicio],
      (s) => ({ titulo: s.nombreServicio, detalle: `S/ ${Number(s.precio).toFixed(2)}` })),
  ]

  return grupos.filter((g) => g.total > 0)
}
