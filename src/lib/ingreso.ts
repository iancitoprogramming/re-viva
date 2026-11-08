// Formulario de ingreso (/ingreso) — esquema compartido entre cliente y servidor.
//
// El formulario del cliente es comodidad, no control: el endpoint corre
// exactamente estas mismas reglas antes de insertar. Los mensajes de error son
// los del prototipo aprobado — dicen qué falta, no "campo requerido".

import { ORDEN } from './peri'

// ─── Opciones cerradas ───────────────────────────────────────────────────────

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

export const COMIDAS: { k: string; label: string }[] = [
  { k: 'desayuno',    label: 'Desayuno' },
  { k: 'colacion_am', label: 'Colación de media mañana' },
  { k: 'almuerzo',    label: 'Almuerzo' },
  { k: 'merienda',    label: 'Merienda' },
  { k: 'cena',        label: 'Cena' },
]

export const OPCIONES = {
  sexo:            ['Femenino', 'Masculino'],
  duracion_ciclo:  ['8 semanas', '12 semanas', '6 meses', 'No sé'],
  sostiene:        ['2', '3', '4', '5', '6'],
  ayunas:          ['Después de comer', 'En ayunas', 'Depende del día'],
  jornada:         ['No, todos mis días son parecidos', 'Sí'],
  domingo:         ['Sí, entero', 'Un rato', 'No'],
  cocina:          ['Sí, cocino sin problema', 'Algo básico', 'No cocino'],
  balanza:         ['Sí, tengo', 'No, pero la compro', 'No y no pienso comprarla'],
  lesion:          ['No', 'Sí'],
  lesion_estado:   ['Asintomática', 'Molestias ocasionales', 'Activa'],
  laboratorio:     ['Sí, los tengo', 'No, pero me los puedo hacer', 'No'],
  estres:          ['Bajo', 'Medio', 'Alto'],
  lugar:           ['Gimnasio completo', 'Gimnasio limitado', 'En casa'],
  duracion_sesion: ['45 min', '60 min', '75 min', '90 min o más'],
  presupuesto:     ['Sí, sin problema', 'Sí, acotado', 'Solo lo imprescindible', 'No, por ahora no'],
  revision:        ['Cada 4 semanas', 'Cada 8 semanas', 'Cuando haga falta'],
} as const

export const ESTADOS_ALTA = ['nuevo', 'en_armado', 'armado', 'descartado'] as const
export type EstadoAlta = (typeof ESTADOS_ALTA)[number]

export const ETIQUETA_ESTADO: Record<string, string> = {
  nuevo:      'Nueva',
  en_armado:  'En armado',
  armado:     'Armada',
  descartado: 'Descartada',
}

// ─── Forma del formulario ────────────────────────────────────────────────────
// Todo llega como string porque son inputs; la normalización vive más abajo.

export interface IngresoForm {
  nombre: string
  email: string
  whatsapp: string
  edad: string
  peso: string
  altura: string
  sexo: string
  objetivo: string
  experiencia: string
  duracion_ciclo: string

  dias: string[]
  horas: Record<string, string>
  comidas: Record<string, string | null>
  sostiene: string
  ayunas: string
  jornada: string
  jornada_detalle: string
  domingo: string

  cae_mal: string
  alergias: string
  no_gusta: string
  cocina: string
  comidas_afuera: string
  balanza: string
  fin_de_semana: string
  agua: string

  lesion: string
  lesion_detalle: string
  lesion_estado: string
  laboratorio: string
  medicacion: string
  sueno: string
  estres: string
  seguimiento: string

  lugar: string
  equipamiento: string
  sesiones_con_entrenador: string
  sesiones_solo: string
  duracion_sesion: string
  otros_deportes: string
  ejercicios_evitar: string
  pasos: string

  presupuesto: string
  revision: string
  comunicacion: string
  intentos_previos: string
  fecha_motivadora: string
  consentimiento: boolean

  /** Honeypot: lo completan los bots, nunca una persona. */
  apodo?: string
}

export function formVacio(): IngresoForm {
  return {
    nombre: '', email: '', whatsapp: '', edad: '', peso: '', altura: '', sexo: '',
    objetivo: '', experiencia: '', duracion_ciclo: '',
    dias: [], horas: {}, comidas: {}, sostiene: '', ayunas: '', jornada: '',
    jornada_detalle: '', domingo: '',
    cae_mal: '', alergias: '', no_gusta: '', cocina: '', comidas_afuera: '',
    balanza: '', fin_de_semana: '', agua: '',
    lesion: '', lesion_detalle: '', lesion_estado: '', laboratorio: '',
    medicacion: '', sueno: '', estres: '', seguimiento: '',
    lugar: '', equipamiento: '', sesiones_con_entrenador: '', sesiones_solo: '',
    duracion_sesion: '', otros_deportes: '', ejercicios_evitar: '', pasos: '',
    presupuesto: '', revision: '', comunicacion: '', intentos_previos: '',
    fecha_motivadora: '', consentimiento: false,
    apodo: '',
  }
}

// ─── Validación ──────────────────────────────────────────────────────────────

export type Errores = Record<string, string>

/** Campos que bloquean el avance, por paso. */
export const CAMPOS_POR_PASO: Record<number, string[]> = {
  1: ['nombre', 'email', 'whatsapp', 'edad', 'peso', 'altura', 'sexo', 'objetivo'],
  2: ['dias', '_horas', '_comidas', 'sostiene', 'ayunas', 'jornada'],
  3: ['cae_mal', 'alergias', 'no_gusta', 'balanza'],
  4: ['lesion', 'laboratorio', 'medicacion'],
  5: ['lugar', '_sesiones'],
  6: ['presupuesto', 'consentimiento'],
}

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function vacio(v: unknown) {
  return typeof v !== 'string' || v.trim() === ''
}

function entero(v: string | undefined) {
  const t = (v ?? '').trim()
  return /^\d+$/.test(t) ? parseInt(t, 10) : null
}

function decimal(v: string | undefined) {
  const t = (v ?? '').trim().replace(',', '.')
  const n = Number(t)
  return t !== '' && Number.isFinite(n) ? n : null
}

function enOpciones(v: string, lista: readonly string[]) {
  return typeof v === 'string' && lista.includes(v)
}

/** Reglas de un campo. Devuelve el mensaje de error, o null si está bien. */
function revisar(campo: string, f: IngresoForm): string | null {
  switch (campo) {
    case 'nombre':
      return vacio(f.nombre) ? 'Falta tu nombre' : null
    case 'email':
      if (vacio(f.email)) return 'Falta el email'
      return EMAIL.test(f.email.trim()) ? null : 'Revisá el email, parece incompleto'
    case 'whatsapp':
      return vacio(f.whatsapp) ? 'Falta el WhatsApp' : null
    case 'edad': {
      if (vacio(f.edad)) return 'Falta la edad'
      const n = entero(f.edad)
      return n !== null && n >= 14 && n <= 95 ? null : 'La edad tiene que estar entre 14 y 95'
    }
    case 'peso': {
      if (vacio(f.peso)) return 'Falta el peso'
      const n = decimal(f.peso)
      return n !== null && n >= 30 && n <= 250 ? null : 'El peso tiene que estar entre 30 y 250 kg'
    }
    case 'altura': {
      if (vacio(f.altura)) return 'Falta la altura'
      const n = entero(f.altura)
      return n !== null && n >= 120 && n <= 230 ? null : 'La altura tiene que estar entre 120 y 230 cm'
    }
    case 'sexo':
      return enOpciones(f.sexo, OPCIONES.sexo) ? null : 'Elegí una opción'
    case 'objetivo':
      return vacio(f.objetivo) ? 'Contame tu objetivo, aunque sea en una línea' : null

    case 'dias':
      return Array.isArray(f.dias) && f.dias.length > 0
        && f.dias.every(d => (DIAS as readonly string[]).includes(d))
        ? null : 'Elegí al menos un día'
    case '_horas':
      return f.dias.length > 0 && f.dias.some(d => !HORA.test(f.horas?.[d] ?? ''))
        ? 'Cargá la hora de cada día' : null
    case '_comidas': {
      const cargadas = ORDEN.filter(k => {
        const t = f.comidas?.[k]
        return typeof t === 'string' && HORA.test(t)
      })
      return cargadas.length < 3 ? 'Cargá al menos tres horarios de comida' : null
    }
    case 'sostiene':
      return enOpciones(f.sostiene, OPCIONES.sostiene) ? null : 'Elegí cuántas comidas sostenés'
    case 'ayunas':
      return enOpciones(f.ayunas, OPCIONES.ayunas) ? null : 'Elegí una opción'
    case 'jornada':
      return enOpciones(f.jornada, OPCIONES.jornada) ? null : 'Elegí una opción'

    case 'cae_mal':
      return vacio(f.cae_mal) ? 'Respondé, aunque sea "ninguno"' : null
    case 'alergias':
      return vacio(f.alergias) ? 'Respondé, aunque sea "ninguna"' : null
    case 'no_gusta':
      return vacio(f.no_gusta) ? 'Respondé, aunque sea "nada"' : null
    case 'balanza':
      return enOpciones(f.balanza, OPCIONES.balanza) ? null : 'Elegí una opción'

    case 'lesion':
      return enOpciones(f.lesion, OPCIONES.lesion) ? null : 'Elegí una opción'
    case 'laboratorio':
      return enOpciones(f.laboratorio, OPCIONES.laboratorio) ? null : 'Elegí una opción'
    case 'medicacion':
      return vacio(f.medicacion) ? 'Respondé, aunque sea "nada"' : null

    case 'lugar':
      return enOpciones(f.lugar, OPCIONES.lugar) ? null : 'Elegí una opción'
    case '_sesiones': {
      const a = entero(f.sesiones_con_entrenador)
      const b = entero(f.sesiones_solo)
      return a === null && b === null
        ? 'Cargá cuántas sesiones hacés conmigo y cuántas solo' : null
    }

    case 'presupuesto':
      return enOpciones(f.presupuesto, OPCIONES.presupuesto) ? null : 'Elegí una opción'
    case 'consentimiento':
      return f.consentimiento === true ? null : 'Necesito tu autorización para seguir'

    default:
      return null
  }
}

/** Valida un paso suelto (navegación del formulario). */
export function validarPaso(paso: number, f: IngresoForm): Errores {
  const errores: Errores = {}
  for (const campo of CAMPOS_POR_PASO[paso] ?? []) {
    const msg = revisar(campo, f)
    if (msg) errores[campo] = msg
  }
  return errores
}

/** Valida el formulario entero. Es lo que corre el servidor antes de insertar. */
export function validarIngreso(f: IngresoForm): Errores {
  const errores: Errores = {}
  for (const paso of Object.keys(CAMPOS_POR_PASO).map(Number)) {
    Object.assign(errores, validarPaso(paso, f))
  }
  return errores
}

// ─── Lectura del payload crudo ───────────────────────────────────────────────
// Un POST armado a mano puede traer cualquier cosa. Acá se lo lleva al shape
// del formulario sin confiar en nada; después lo valida validarIngreso().

function texto(v: unknown): string {
  if (typeof v === 'string') return v
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  return ''
}

export function parsearForm(body: unknown): IngresoForm {
  const b = (body ?? {}) as Record<string, unknown>
  const f = formVacio()

  const plano = f as unknown as Record<string, unknown>
  for (const k of Object.keys(f)) {
    if (k === 'dias' || k === 'horas' || k === 'comidas' || k === 'consentimiento') continue
    plano[k] = texto(b[k])
  }

  f.consentimiento = b.consentimiento === true

  f.dias = Array.isArray(b.dias)
    ? DIAS.filter(d => (b.dias as unknown[]).includes(d))
    : []

  const horas = (b.horas ?? {}) as Record<string, unknown>
  for (const d of f.dias) {
    const h = texto(horas[d])
    if (h) f.horas[d] = h
  }

  const comidas = (b.comidas ?? {}) as Record<string, unknown>
  for (const k of ORDEN) {
    if (!(k in comidas)) continue
    const t = comidas[k]
    f.comidas[k] = t === null ? null : texto(t)
  }

  return f
}

// ─── Normalización al shape de la tabla ──────────────────────────────────────

function limpio(v: string | undefined) {
  const t = (v ?? '').trim()
  return t === '' ? null : t
}

function opcional(v: string | undefined, lista: readonly string[]) {
  const t = (v ?? '').trim()
  return t !== '' && lista.includes(t) ? t : null
}

export function normalizarIngreso(f: IngresoForm) {
  // Días siempre en orden de semana.
  const dias = DIAS.filter(d => f.dias.includes(d)) as string[]

  const horariosEntrenamiento: Record<string, string> = {}
  for (const d of dias) horariosEntrenamiento[d] = f.horas[d]

  // Las cinco comidas siempre presentes; las que no hace, null.
  const horariosComidas: Record<string, string | null> = {}
  for (const k of ORDEN) {
    const t = f.comidas?.[k]
    horariosComidas[k] = typeof t === 'string' && HORA.test(t) ? t : null
  }

  const conEntrenador = entero(f.sesiones_con_entrenador)
  const solo          = entero(f.sesiones_solo)
  const tope          = (n: number) => Math.max(0, Math.min(7, n))

  return {
    nombre:        f.nombre.trim(),
    email:         f.email.trim().toLowerCase(),
    whatsapp:      f.whatsapp.trim(),
    edad:          entero(f.edad)!,
    sexo:          f.sexo,
    pesoKg:        decimal(f.peso)!.toFixed(2),
    alturaCm:      entero(f.altura)!,
    objetivo:      f.objetivo.trim(),
    experiencia:   limpio(f.experiencia),
    duracionCiclo: opcional(f.duracion_ciclo, OPCIONES.duracion_ciclo),

    diasEntrenamiento:  dias,
    horariosEntrenamiento,
    horariosComidas,
    comidasSostenibles: entero(f.sostiene)!,
    ayunas:             f.ayunas,
    jornadaVariable:    f.jornada === 'Sí',
    jornadaDetalle:     f.jornada === 'Sí' ? limpio(f.jornada_detalle) : null,
    domingo:            opcional(f.domingo, OPCIONES.domingo),

    caeMal:        f.cae_mal.trim(),
    alergias:      f.alergias.trim(),
    noGusta:       f.no_gusta.trim(),
    cocina:        opcional(f.cocina, OPCIONES.cocina),
    comidasAfuera: limpio(f.comidas_afuera),
    balanza:       f.balanza,
    finDeSemana:   limpio(f.fin_de_semana),
    agua:          limpio(f.agua),

    lesion:        f.lesion === 'Sí',
    lesionDetalle: f.lesion === 'Sí' ? limpio(f.lesion_detalle) : null,
    lesionEstado:  f.lesion === 'Sí' ? opcional(f.lesion_estado, OPCIONES.lesion_estado) : null,
    laboratorio:   f.laboratorio,
    medicacion:    f.medicacion.trim(),
    sueno:         limpio(f.sueno),
    estres:        opcional(f.estres, OPCIONES.estres),
    seguimiento:   limpio(f.seguimiento),

    lugar:                 f.lugar,
    equipamiento:          limpio(f.equipamiento),
    sesionesConEntrenador: conEntrenador !== null ? tope(conEntrenador) : null,
    sesionesSolo:          solo !== null ? tope(solo) : null,
    duracionSesion:        opcional(f.duracion_sesion, OPCIONES.duracion_sesion),
    otrosDeportes:         limpio(f.otros_deportes),
    ejerciciosEvitar:      limpio(f.ejercicios_evitar),
    pasos:                 limpio(f.pasos),

    presupuestoSuplementos: f.presupuesto,
    revision:               opcional(f.revision, OPCIONES.revision),
    comunicacion:           limpio(f.comunicacion),
    intentosPrevios:        limpio(f.intentos_previos),
    fechaMotivadora:        limpio(f.fecha_motivadora),
    consentimiento:         true,
  }
}

export type AltaInsert = ReturnType<typeof normalizarIngreso>
