// ─── Constantes globales del proyecto ─────────────────────────────────────────

export const INSTAGRAM_URL = 'https://instagram.com/igztrainer'
export const WHATSAPP_NUMBER = '5491122835621'
export const ALIAS = 'REVIVA.IGZ'

export const WHATSAPP_COMPROBANTE = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Ian, te envío mi comprobante de pago para comenzar con REVIVA.')}`
export const WHATSAPP_CONSULTA   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Ian, tengo una consulta sobre REVIVA.')}`

export const PLAN_CTA_HREF = '/login?modo=registro'

// ─── Planes disponibles ────────────────────────────────────────────────────────
export const PLANES_MP = {
  'on-demand': {
    titulo: 'Plan On Demand',
    descripcion: 'Autoguiado y autodidacta. 8 a 10 semanas de proceso con 100% responsabilidad propia.',
    monto: 33000,
    badge: 'Pago único',
  },
  'online-mensual': {
    titulo: 'Plan Online 100% — Mensual',
    descripcion: 'Seguimiento nutricional y de entrenamiento completo desde donde estés.',
    monto: 88000,
    badge: 'Mensual',
  },
  'online-presencial-mensual': {
    titulo: 'Plan Online + Presencial — Mensual',
    descripcion: 'Plan online con 1 clase presencial por semana incluida.',
    monto: 110000,
    badge: 'Mensual',
  },
  'online-trimestral': {
    titulo: 'Plan Online 100% — Trimestral',
    descripcion: 'El compromiso que construye hábitos reales. 3 meses.',
    monto: 236500,
    badge: 'Trimestral',
  },
  'online-presencial-trimestral': {
    titulo: 'Plan Online + Presencial — Trimestral',
    descripcion: 'Plan trimestral con 1 clase presencial semanal.',
    monto: 269500,
    badge: 'Trimestral',
  },
  'presencial-3x-mensual': {
    titulo: 'Presencial 3 veces/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 3 veces por semana.',
    monto: 198000,
    badge: 'Presencial',
  },
  'presencial-4x-mensual': {
    titulo: 'Presencial 4 veces/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 4 veces por semana.',
    monto: 246400,
    badge: 'Presencial',
  },
  'presencial-5x-mensual': {
    titulo: 'Presencial 5 veces/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 5 veces por semana.',
    monto: 286000,
    badge: 'Presencial',
  },
  'ebook-ryan-humiston': {
    titulo: 'Ebook — Ryan Humiston',
    descripcion: 'Programa completo de entrenamiento e hipertrofia de Ryan Humiston. Planificación, progresión y técnica.',
    monto: 21890,
    badge: 'PDF Digital',
  },
  'ebook-gluteos': {
    titulo: 'Ebook — Glúteos',
    descripcion: 'Guía completa de entrenamiento de glúteos. Ejercicios, progresión y técnica para resultados reales.',
    monto: 21890,
    badge: 'PDF Digital',
  },
  'ebook-rentable': {
    titulo: 'Curso — Personal Trainer Rentable',
    descripcion: 'El sistema completo para que ser entrenador deje de ser un hobby y se transforme en un negocio real. Captación, conversión, retención y modelo de ingresos.',
    monto: 54890,           // Precio de pre-venta (lanzamiento)
    montoOriginal: 87890,   // Precio sugerido post-lanzamiento (para mostrar descuento)
    badge: 'Pre-venta',
  },
} as const

export type PlanMPKey = keyof typeof PLANES_MP

// ─── Duración en días por tipo de plan ────────────────────────────────────────
// Se usa al activar para calcular fechaVencimiento
export const PLAN_DURACIONES_DIAS: Record<string, number> = {
  'on-demand':                    70,   // ~10 semanas
  'online-mensual':               30,
  'online-presencial-mensual':    30,
  'online-trimestral':            90,
  'online-presencial-trimestral': 90,
  'presencial-3x-mensual':        30,
  'presencial-4x-mensual':        30,
  'presencial-5x-mensual':        30,
  'presencial-3x-trimestral':     90,
  'presencial-4x-trimestral':     90,
  'presencial-5x-trimestral':     90,
  'presencial-3x-semestral':      180,
  'presencial-4x-semestral':      180,
  'presencial-5x-semestral':      180,
  'ebook-ryan-humiston':            0,
  'ebook-gluteos':                  0,
  'ebook-rentable':                 0,
}

// ─── Etiquetas legibles de tipos de plan ──────────────────────────────────────
export const PLAN_LABELS: Record<string, string> = {
  'on-demand':                    'On Demand (pago único)',
  'online-mensual':               'Online 100% — Mensual',
  'online-presencial-mensual':    'Online + Presencial — Mensual',
  'online-trimestral':            'Online 100% — Trimestral',
  'online-presencial-trimestral': 'Online + Presencial — Trimestral',
  'presencial-3x-mensual':        'Presencial 3x/sem — Mensual',
  'presencial-4x-mensual':        'Presencial 4x/sem — Mensual',
  'presencial-5x-mensual':        'Presencial 5x/sem — Mensual',
  'presencial-3x-trimestral':     'Presencial 3x/sem — Trimestral',
  'presencial-4x-trimestral':     'Presencial 4x/sem — Trimestral',
  'presencial-5x-trimestral':     'Presencial 5x/sem — Trimestral',
  'presencial-3x-semestral':      'Presencial 3x/sem — Semestral',
  'presencial-4x-semestral':      'Presencial 4x/sem — Semestral',
  'presencial-5x-semestral':      'Presencial 5x/sem — Semestral',
  'ebook-ryan-humiston':          'Ebook Ryan Humiston',
  'ebook-gluteos':                'Ebook Glúteos',
  'ebook-rentable':               'Curso Personal Trainer Rentable',
}

// ─── Set de planes que son ebooks/cursos digitales (entrega manual por WhatsApp) ──
export const ES_EBOOK = new Set<string>([
  'ebook-ryan-humiston',
  'ebook-gluteos',
  'ebook-rentable',
])

