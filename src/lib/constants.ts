// ─── Constantes globales del proyecto ─────────────────────────────────────────

export const INSTAGRAM_URL = 'https://instagram.com/igztrainer'
export const WHATSAPP_NUMBER = '5491122835621'
export const ALIAS = 'REVIVA.IGZ'

export const WHATSAPP_COMPROBANTE = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Ian, te envío mi comprobante de pago para comenzar con REVIVA.')}`
export const WHATSAPP_CONSULTA   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Ian, tengo una consulta sobre REVIVA.')}`

export const PLAN_CTA_HREF = '/login?modo=registro'

// ─── Links de suscripción de Mercado Pago (débito automático) ────────────────
// Creados por Ian en MP. Cada uno es un preapproval: cobra todos los meses solo.
// No pasan por /api/payments/create-preference, así que el webhook NO los
// registra en la DB — por eso el CTA de la landing sigue siendo el registro y
// estos links se ofrecen en /pendiente, cuando ya sabemos quién es el cliente.
export const MP_LINKS = {
  onlineMensual:           'https://mpago.la/2iEJkBV', // Online — $88.000/mes
  onlinePresencialMensual: 'https://mpago.la/2JHcHnP', // Online + 1 clase — $110.000/mes
  individual2x:            'https://mpago.la/21mEnfS', // Individual 2x/sem — $208.000/mes
  individual3x:            'https://mpago.la/1ZnSaet', // Individual 3x/sem — $312.000/mes
  individual4x:            'https://mpago.la/159padT', // Individual 4x/sem — $416.000/mes
  individual5x:            'https://mpago.la/1w4HaAm', // Individual 5x/sem — $520.000/mes
  individual2xTrimestral:  'https://mpago.la/29mgwyM', // Trimestral 2x/sem — $561.600 / 3 meses
  individual3xTrimestral:  'https://mpago.la/2X1eVi2', // Trimestral 3x/sem — $842.400 / 3 meses
  duo2x:                   'https://mpago.la/1mHq7SK', // En dúo 2x/sem — $145.600/mes
  duo3x:                   'https://mpago.la/2h1PKhZ', // En dúo 3x/sem — $218.400/mes
  trios2x:                 'https://mpago.la/1XyJsF4', // En tríos 2x/sem — $124.800/mes
  trios3x:                 'https://mpago.la/1KAkXbm', // En tríos 3x/sem — $187.200/mes
} as const

// ─── Precio por transferencia bancaria ──────────────────────────────────────
// 6% menos que tarjeta/efectivo, redondeado al mil. Solo aplica al presencial
// individual: en grupo y en los online el precio es uno solo.
export const PRECIO_TRANSFERENCIA: Record<string, number> = {
  'individual-2x-mensual': 195000,
  'individual-3x-mensual': 293000,
  'individual-4x-mensual': 391000,
  'individual-5x-mensual': 489000,
}

// Valor de la clase suelta, para mostrar el "precio por clase" en la landing.
export const VALOR_CLASE = { tarjeta: 24000, transferencia: 22560 } as const

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
  // ─── Presencial individual — mensual ───
  'individual-2x-mensual': {
    titulo: 'Individual presencial 2x/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 2 veces por semana. Agenda reservada para vos.',
    monto: 208000,
    badge: 'Presencial',
  },
  'individual-3x-mensual': {
    titulo: 'Individual presencial 3x/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 3 veces por semana. Agenda reservada para vos.',
    monto: 312000,
    badge: 'Presencial',
  },
  'individual-4x-mensual': {
    titulo: 'Individual presencial 4x/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 4 veces por semana. Agenda reservada para vos.',
    monto: 416000,
    badge: 'Presencial',
  },
  'individual-5x-mensual': {
    titulo: 'Individual presencial 5x/semana — Mensual',
    descripcion: 'Entrenamiento privado presencial 5 veces por semana. Agenda reservada para vos.',
    monto: 520000,
    badge: 'Presencial',
  },
  // ─── Presencial individual — trimestral (10% off, hasta 3 cuotas) ───
  'individual-2x-trimestral': {
    titulo: 'Individual presencial 2x/semana — Trimestral',
    descripcion: '3 meses de proceso. 2 clases por semana — equivale a $187.200 por mes.',
    monto: 561600,
    badge: 'Trimestral',
  },
  'individual-3x-trimestral': {
    titulo: 'Individual presencial 3x/semana — Trimestral',
    descripcion: '3 meses de proceso. 3 clases por semana — equivale a $280.800 por mes.',
    monto: 842400,
    badge: 'Trimestral',
  },
  'individual-4x-trimestral': {
    titulo: 'Individual presencial 4x/semana — Trimestral',
    descripcion: '3 meses de proceso. 4 clases por semana — equivale a $374.400 por mes.',
    monto: 1123200,
    badge: 'Trimestral',
  },
  'individual-5x-trimestral': {
    titulo: 'Individual presencial 5x/semana — Trimestral',
    descripcion: '3 meses de proceso. 5 clases por semana — equivale a $468.000 por mes.',
    monto: 1404000,
    badge: 'Trimestral',
  },
  // ─── En grupo — precio por persona ───
  'duo-2x-mensual': {
    titulo: 'En dúo 2x/semana — Mensual',
    descripcion: 'Entrenás junto a otra persona, 2 veces por semana. Precio por persona.',
    monto: 145600,
    badge: 'En dúo',
  },
  'duo-3x-mensual': {
    titulo: 'En dúo 3x/semana — Mensual',
    descripcion: 'Entrenás junto a otra persona, 3 veces por semana. Precio por persona.',
    monto: 218400,
    badge: 'En dúo',
  },
  'trio-2x-mensual': {
    titulo: 'En trío 2x/semana — Mensual',
    descripcion: 'Grupo reducido de 3 personas, 2 veces por semana. Precio por persona.',
    monto: 124800,
    badge: 'En trío',
  },
  'trio-3x-mensual': {
    titulo: 'En trío 3x/semana — Mensual',
    descripcion: 'Grupo reducido de 3 personas, 3 veces por semana. Precio por persona.',
    monto: 187200,
    badge: 'En trío',
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
  'individual-2x-mensual':        30,
  'individual-3x-mensual':        30,
  'individual-4x-mensual':        30,
  'individual-5x-mensual':        30,
  'individual-2x-trimestral':     90,
  'individual-3x-trimestral':     90,
  'individual-4x-trimestral':     90,
  'individual-5x-trimestral':     90,
  'duo-2x-mensual':               30,
  'duo-3x-mensual':               30,
  'trio-2x-mensual':              30,
  'trio-3x-mensual':              30,
  // Planes discontinuados: siguen acá porque hay pagos viejos en la DB que
  // el back office tiene que poder mostrar.
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
  'individual-2x-mensual':        'Individual 2x/sem — Mensual',
  'individual-3x-mensual':        'Individual 3x/sem — Mensual',
  'individual-4x-mensual':        'Individual 4x/sem — Mensual',
  'individual-5x-mensual':        'Individual 5x/sem — Mensual',
  'individual-2x-trimestral':     'Individual 2x/sem — Trimestral',
  'individual-3x-trimestral':     'Individual 3x/sem — Trimestral',
  'individual-4x-trimestral':     'Individual 4x/sem — Trimestral',
  'individual-5x-trimestral':     'Individual 5x/sem — Trimestral',
  'duo-2x-mensual':               'En dúo 2x/sem — Mensual',
  'duo-3x-mensual':               'En dúo 3x/sem — Mensual',
  'trio-2x-mensual':              'En trío 2x/sem — Mensual',
  'trio-3x-mensual':              'En trío 3x/sem — Mensual',
  // Planes discontinuados — se conservan para los pagos históricos.
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

