// Opciones del cuestionario de ingreso v2 (oferta Hormozi).
// Fuente única: onboarding, ficha del cliente en admin y mail al trainer.

type Opcion = { value: string; label: string }

export function etiqueta(opciones: readonly Opcion[], value?: string | null): string {
  if (!value) return '—'
  return opciones.find(o => o.value === value)?.label ?? value
}

export function etiquetas(opciones: readonly Opcion[], values?: string[] | null): string {
  if (!values?.length) return '—'
  return values.map(v => etiqueta(opciones, v)).join(', ')
}

// Cada obstáculo tiene su solución concreta dentro de los documentos.
export const OBSTACULOS: readonly Opcion[] = [
  { value: 'que_comer',     label: 'No sé qué comer ni cuánto' },
  { value: 'que_comprar',   label: 'No sé qué comprar' },
  { value: 'tiempo_cocina', label: 'No tengo tiempo de cocinar' },
  { value: 'como_afuera',   label: 'Como mucho afuera' },
  { value: 'suplementos',   label: 'No sé qué suplementos tomar' },
  { value: 'tecnica',       label: 'No sé si entreno bien' },
  { value: 'constancia',    label: 'Arranco y lo dejo' },
  { value: 'sin_resultados', label: 'Entreno y no veo cambios' },
] as const

export const HORARIOS_ENTRENAMIENTO: readonly Opcion[] = [
  { value: 'manana',   label: 'Mañana (antes de las 11)' },
  { value: 'mediodia', label: 'Mediodía (11 a 15)' },
  { value: 'tarde',    label: 'Tarde (15 a 19)' },
  { value: 'noche',    label: 'Noche (después de las 19)' },
] as const

export const FRECUENCIA_COME_AFUERA: readonly Opcion[] = [
  { value: 'nunca', label: 'Casi nunca' },
  { value: '1-2',   label: '1 o 2 comidas por semana' },
  { value: '3-5',   label: '3 a 5 comidas por semana' },
  { value: '6+',    label: '6 o más por semana' },
] as const

// A partir de 3 comidas afuera por semana se agrega la Guía para comer afuera.
export function requiereGuiaComerAfuera(comeAfuera?: string | null): boolean {
  return comeAfuera === '3-5' || comeAfuera === '6+'
}

export const LUGARES_COME_AFUERA: readonly Opcion[] = [
  { value: 'comedor_trabajo', label: 'Comedor / vianda del trabajo' },
  { value: 'delivery',        label: 'Delivery' },
  { value: 'rotiseria',       label: 'Rotisería' },
  { value: 'parrilla',        label: 'Parrilla' },
  { value: 'pizzeria',        label: 'Pizzería' },
  { value: 'sushi',           label: 'Sushi' },
  { value: 'comida_rapida',   label: 'Comida rápida' },
  { value: 'kiosco',          label: 'Kiosco / estación de servicio' },
] as const

export const SESIONES_COCINA: readonly Opcion[] = [
  { value: 'dos',       label: '2 sesiones por semana (ej. domingo y miércoles)' },
  { value: 'una',       label: '1 sola sesión por semana' },
  { value: 'no_cocino', label: 'No cocino / casi no tengo tiempo' },
] as const

export const SUPERMERCADOS: readonly Opcion[] = [
  { value: 'coto',      label: 'Coto (Coto Digital)' },
  { value: 'carrefour', label: 'Carrefour' },
  { value: 'jumbo',     label: 'Jumbo' },
  { value: 'disco',     label: 'Disco' },
  { value: 'dia',       label: 'Día' },
  { value: 'changomas', label: 'ChangoMás' },
  { value: 'chino',     label: 'Supermercado de barrio' },
  { value: 'otro',      label: 'Otro' },
] as const

// Se guarda en preferenciasAlimentarias (el pipeline lee "vegan"/"vegeta").
export const ESTILOS_ALIMENTACION: readonly Opcion[] = [
  { value: 'Omnívoro',     label: 'Como de todo' },
  { value: 'Vegetariano',  label: 'Vegetariano' },
  { value: 'Vegano',       label: 'Vegano' },
  { value: 'Sin TACC',     label: 'Sin TACC (celíaco)' },
] as const
