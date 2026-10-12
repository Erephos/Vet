// Si el backend rechazó los datos (400) y explicó el motivo, mostramos ese motivo;
// en cualquier otro caso usamos el mensaje genérico que cada page ya tenía.
export function mensajeDeError(err, porDefecto) {
  if (err && err.status === 400) {
    const motivos = err.errores ? Object.values(err.errores) : []
    if (motivos.length > 0) return motivos.join(' ')
    if (err.detalle) return err.detalle
  }
  return porDefecto
}

// Para borrados: si el backend bloqueó la operación (409) y explicó por qué
// (por ejemplo "3 mascotas usan esta raza"), mostramos ese motivo exacto.
export function mensajeDeBorrado(err, porDefecto) {
  if (err && err.status === 409 && err.detalle) return err.detalle
  return porDefecto
}
