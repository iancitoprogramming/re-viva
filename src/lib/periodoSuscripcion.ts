// Reglas de período del débito automático. Módulo puro (sin base ni mails)
// para poder testearlo: qué planes se suscriben, cada cuánto se cobra y cómo
// se corre el vencimiento con cada cobro.

import { MP_SUSCRIPCION_POR_PLAN, PLANES_MP, PLAN_DURACIONES_DIAS, type PlanMPKey } from '@/lib/constants'

// Planes que se pueden pagar con débito automático: los mismos que tenían link.
export function esPlanSuscribible(planTipo: string): planTipo is PlanMPKey {
  return Object.hasOwn(MP_SUSCRIPCION_POR_PLAN, planTipo) && Object.hasOwn(PLANES_MP, planTipo)
}

// Cada cuántos meses se cobra: mensual = 1, trimestral = 3.
export function mesesPorCobro(planTipo: string): number {
  return Math.max(1, Math.round((PLAN_DURACIONES_DIAS[planTipo] ?? 30) / 30))
}

// Suma meses de calendario. 31 de enero + 1 mes = 28 (o 29) de febrero.
export function sumarMeses(fecha: Date, meses: number): Date {
  const r = new Date(fecha)
  const dia = r.getUTCDate()
  r.setUTCDate(1)
  r.setUTCMonth(r.getUTCMonth() + meses)
  const ultimoDia = new Date(Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0)).getUTCDate()
  r.setUTCDate(Math.min(dia, ultimoDia))
  return r
}

// Un cobro aprobado paga un período más: se suma al vencimiento vigente, o
// arranca de hoy si el plan ya estaba vencido.
export function nuevoVencimiento(vencimientoActual: Date | null, planTipo: string, ahora = new Date()): Date {
  const base = vencimientoActual && vencimientoActual > ahora ? vencimientoActual : ahora
  return sumarMeses(base, mesesPorCobro(planTipo))
}
