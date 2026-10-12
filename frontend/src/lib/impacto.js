// Texto que avisa qué más se eliminará junto con un registro, a partir de lo que calcula el backend:
// { mascotas, consultas, serviciosAplicados }.

export const IMPACTO_DESCONOCIDO = { desconocido: true }

function unir(partes) {
  if (partes.length === 1) return partes[0]
  return `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`
}

function cantidad(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`
}

export function describirImpacto(impacto) {
  if (impacto === null || impacto === undefined) {
    return 'Calculando qué otros datos se eliminarán…'
  }

  if (impacto.desconocido) {
    return 'Se eliminarán también, de forma permanente, todos los datos que dependen de este registro.'
  }

  const partes = []
  if (impacto.mascotas > 0) partes.push(cantidad(impacto.mascotas, 'mascota', 'mascotas'))
  if (impacto.consultas > 0) partes.push(cantidad(impacto.consultas, 'consulta', 'consultas'))
  if (impacto.serviciosAplicados > 0) {
    partes.push(cantidad(impacto.serviciosAplicados, 'servicio aplicado', 'servicios aplicados'))
  }

  if (partes.length === 0) return 'No tiene otros datos asociados.'

  return `Se eliminarán también, de forma permanente: ${unir(partes)}.`
}
