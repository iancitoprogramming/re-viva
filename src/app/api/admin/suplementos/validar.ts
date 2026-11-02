// Validación compartida de alta/edición de suplementos (admin).

import { OBJETIVOS_SUPLEMENTO, type ObjetivoSuplementoValue } from '@/lib/suplementos'

const TEXTOS = ['nombre', 'paraQueSirve', 'aQuienSeRecomienda', 'comoSeUsa'] as const
const OPCIONALES = ['marca', 'linkAfiliado', 'imagenUrl'] as const
const OBJETIVOS = new Set<string>(OBJETIVOS_SUPLEMENTO.map(o => o.value))

export function datosSuplemento(body: Record<string, unknown>, esAlta: boolean):
  { data: Record<string, unknown> } | { error: string } {
  const data: Record<string, unknown> = {}

  if (esAlta || body.slug !== undefined) {
    const slug = String(body.slug ?? '').trim().toLowerCase()
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: 'Slug inválido (minúsculas y guiones, ej. creatina-monohidrato).' }
    data.slug = slug
  }
  for (const k of TEXTOS) {
    if (body[k] === undefined && !esAlta) continue
    const v = String(body[k] ?? '').trim()
    if (!v) return { error: `Falta "${k}".` }
    data[k] = v
  }
  for (const k of OPCIONALES) {
    if (body[k] === undefined) continue
    const v = String(body[k] ?? '').trim()
    data[k] = v || null
  }
  if (typeof data.linkAfiliado === 'string' && !/^https:\/\//.test(data.linkAfiliado)) {
    return { error: 'El link de afiliado tiene que empezar con https://' }
  }
  if (body.objetivos !== undefined) {
    const objetivos = Array.isArray(body.objetivos) ? body.objetivos.map(String).filter(o => OBJETIVOS.has(o)) : []
    if (!objetivos.length) return { error: 'Elegí al menos un objetivo.' }
    data.objetivos = objetivos as ObjetivoSuplementoValue[]
  } else if (esAlta) {
    return { error: 'Elegí al menos un objetivo.' }
  }
  if (body.precioArs !== undefined) {
    const n = Number(body.precioArs)
    data.precioArs = body.precioArs === '' || body.precioArs === null || !Number.isFinite(n) ? null : n
  }
  if (body.prioridad !== undefined) data.prioridad = Math.round(Number(body.prioridad) || 0)
  if (body.activo !== undefined) data.activo = body.activo === true
  // Cada vez que se toca el link o el precio, queda fecha de relevamiento
  if (data.linkAfiliado !== undefined || data.precioArs !== undefined) data.relevadoEn = new Date()

  return { data }
}
