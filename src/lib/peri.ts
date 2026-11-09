// Derivación peri-entreno — módulo puro, sin dependencias.
//
// El cliente no sabe cuál es su toma pre-entreno, así que no se le pregunta:
// se le piden los horarios y acá se deduce. Para cada hora de entrenamiento
// distinta, la toma PRE es la comida más cercana dentro de las 3 horas previas
// y la POST la más cercana dentro de las 4 horas posteriores. Las comidas
// marcadas como "no la hago" (null) quedan fuera del cálculo.
//
// El resultado NUNCA se guarda en la tabla: se recalcula siempre desde los
// horarios, así que si el cliente corrige un horario la derivación lo sigue.

export type Comidas = Record<string, string | null>

export const ORDEN = ['desayuno', 'colacion_am', 'almuerzo', 'merienda', 'cena'] as const

export const NOMBRE_COMIDA: Record<string, string> = {
  desayuno:    'Desayuno',
  colacion_am: 'Colación de media mañana',
  almuerzo:    'Almuerzo',
  merienda:    'Merienda',
  cena:        'Cena',
}

export interface Toma {
  comida:  string // clave: "desayuno" | "colacion_am" | ...
  nombre:  string // etiqueta legible
  hora:    string // "09:45"
  minutos: number // distancia al entrenamiento
}

export interface Peri {
  pre:  Toma | null
  post: Toma | null
}

const min = (t: string) => +t.slice(0, 2) * 60 + +t.slice(3, 5)

export function peri(horaEntreno: string, comidas: Comidas): Peri {
  const h = min(horaEntreno)
  let pre: Toma | null = null
  let post: Toma | null = null

  for (const k of ORDEN) {
    const t = comidas[k]
    if (!t) continue

    const antes = h - min(t)
    if (antes > 0 && antes <= 180 && (!pre || antes < pre.minutos))
      pre = { comida: k, nombre: NOMBRE_COMIDA[k], hora: t, minutos: antes }

    const despues = min(t) - h
    if (despues >= 0 && despues <= 240 && (!post || despues < post.minutos))
      post = { comida: k, nombre: NOMBRE_COMIDA[k], hora: t, minutos: despues }
  }

  return { pre, post }
}

// Agrupa los días por hora de entrenamiento. Más de una entrada significa que
// el plan necesita más de una plantilla de comidas.
export function agruparPorHora(
  dias: string[],
  horarios: Record<string, string>,
): { hora: string; dias: string[] }[] {
  const mapa: Record<string, string[]> = {}
  for (const d of dias) {
    const h = horarios?.[d]
    if (!h) continue
    ;(mapa[h] = mapa[h] ?? []).push(d)
  }
  return Object.keys(mapa)
    .sort()
    .map(hora => ({ hora, dias: mapa[hora] }))
}
