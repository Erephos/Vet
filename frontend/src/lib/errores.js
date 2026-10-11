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
