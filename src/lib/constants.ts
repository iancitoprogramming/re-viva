// ─── Constantes globales del proyecto ─────────────────────────────────────────
// Cualquier cambio de URL, número o alias se hace UNA sola vez acá.

export const INSTAGRAM_URL = 'https://instagram.com/igztrainer'
export const WHATSAPP_NUMBER = '5491122835621'
export const ALIAS = 'REVIVA.IGZ'

export const WHATSAPP_COMPROBANTE = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Ian, te envío mi comprobante de pago para comenzar con REVIVA.')}`
export const WHATSAPP_CONSULTA   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Ian, tengo una consulta sobre REVIVA.')}`

export const PLAN_CTA_HREF = '/login?modo=registro'

// ─── Planes disponibles para Mercado Pago ────────────────────────────────────
// Mantener sincronizado con los precios de PlanesTabs.tsx
export const PLANES_MP = {
  'online-mensual': {
    titulo: 'Plan Online 100% — Mensual',
    descripcion: 'Seguimiento nutricional y de entrenamiento completo desde donde estés.',
    monto: 80000,
    badge: 'Mensual',
  },
  'online-presencial-mensual': {
    titulo: 'Plan Online + Presencial — Mensual',
    descripcion: 'Plan online con 1 clase presencial por semana incluida.',
    monto: 100000,
    badge: 'Mensual',
  },
  'online-trimestral': {
    titulo: 'Plan Online 100% — Trimestral',
    descripcion: 'El compromiso que construye hábitos reales. 3 meses.',
    monto: 215000,
    badge: 'Trimestral',
  },
  'online-presencial-trimestral': {
    titulo: 'Plan Online + Presencial — Trimestral',
    descripcion: 'Plan trimestral con 1 clase presencial semanal.',
    monto: 245000,
    badge: 'Trimestral',
  },
  'presencial-3x-mensual': {
    titulo: 'Presencial 3 veces/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 3 veces por semana.',
    monto: 180000,
    badge: 'Presencial',
  },
  'presencial-4x-mensual': {
    titulo: 'Presencial 4 veces/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 4 veces por semana.',
    monto: 224000,
    badge: 'Presencial',
  },
  'presencial-5x-mensual': {
    titulo: 'Presencial 5 veces/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 5 veces por semana.',
    monto: 260000,
    badge: 'Presencial',
  },
} as const

export type PlanMPKey = keyof typeof PLANES_MP
