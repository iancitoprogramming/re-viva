// Ficha de alta: alertas + prompt de armado.
//
// Una sola fuente para las dos salidas que las usan — el mail que recibe el
// entrenador y la vista interna /admin/altas/[id] — así el alta se puede leer
// desde el celular sin entrar al panel.
//
// Nada de esto se guarda: se recalcula siempre desde los horarios cargados.

import { COMIDAS, type EstadoAlta } from './ingreso'
import { agruparPorHora, peri } from './peri'

// Shape mínimo que necesita la ficha — es lo que devuelve Prisma para un alta.
export interface AltaFicha {
  id: string
  creadoEn: Date | string
  estado: EstadoAlta | string

  nombre: string
  email: string
  whatsapp: string
  edad: number
  sexo: string
  pesoKg: number | string
  alturaCm: number
  objetivo: string
  experiencia: string | null
  duracionCiclo: string | null

  diasEntrenamiento: string[]
  horariosEntrenamiento: Record<string, string>
  horariosComidas: Record<string, string | null>
  comidasSostenibles: number
  ayunas: string
  jornadaVariable: boolean
  jornadaDetalle: string | null
  domingo: string | null

  caeMal: string
  alergias: string
  noGusta: string
  cocina: string | null
  comidasAfuera: string | null
  balanza: string
  finDeSemana: string | null
  agua: string | null

  lesion: boolean
  lesionDetalle: string | null
  lesionEstado: string | null
  laboratorio: string
  medicacion: string
  sueno: string | null
  estres: string | null
  seguimiento: string | null

  lugar: string
  equipamiento: string | null
  sesionesConEntrenador: number | null
  sesionesSolo: number | null
  duracionSesion: string | null
  otrosDeportes: string | null
  ejerciciosEvitar: string | null
  pasos: string | null

  presupuestoSuplementos: string
  revision: string | null
  comunicacion: string | null
  intentosPrevios: string | null
  fechaMotivadora: string | null
  notasInternas?: string | null
}

export type TipoAlerta = 'stop' | 'aviso' | 'ok'

export interface Alerta {
  tipo: TipoAlerta
  texto: string
}

export interface Ficha {
  alertas: Alerta[]
  prompt: string
  tmb: number | null
}

const guion = (v: unknown) => {
  if (v === null || v === undefined) return '—'
  const t = String(v).trim()
  return t === '' ? '—' : t
}

/** Mifflin-St Jeor, sin factor de actividad: ese factor lo decide el entrenador. */
export function calcularTMB(alta: Pick<AltaFicha, 'pesoKg' | 'alturaCm' | 'edad' | 'sexo'>): number | null {
  const peso = Number(alta.pesoKg)
  if (!Number.isFinite(peso) || !alta.alturaCm || !alta.edad || !alta.sexo) return null
  const base = 10 * peso + 6.25 * alta.alturaCm - 5 * alta.edad
  return Math.round(alta.sexo === 'Masculino' ? base + 5 : base - 161)
}

function fechaAR(d: Date | string) {
  const fecha = typeof d === 'string' ? new Date(d) : d
  return fecha.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
}

/**
 * Arma la ficha completa: las alertas de la vista interna y el bloque de texto
 * plano que se copia a la terminal para que el agente arranque el plan.
 */
export function construirFicha(alta: AltaFicha): Ficha {
  const alertas: Alerta[] = []
  const flag = (tipo: TipoAlerta, texto: string) => alertas.push({ tipo, texto })

  const L: string[] = []
  const tmb = calcularTMB(alta)
  const comidas = alta.horariosComidas ?? {}
  const horarios = alta.horariosEntrenamiento ?? {}
  const dias = alta.diasEntrenamiento ?? []

  L.push(`# ALTA RE-VIVA — ${guion(alta.nombre)}`)
  L.push(`Recibido: ${fechaAR(alta.creadoEn)} · Canal: revivabyigz.com/ingreso`)
  L.push('')

  L.push('## 1. Perfil')
  L.push(`- Edad: ${guion(alta.edad)} · Sexo: ${guion(alta.sexo)} · Peso: ${guion(alta.pesoKg)} kg · Altura: ${guion(alta.alturaCm)} cm`)
  if (tmb) L.push(`- TMB (Mifflin-St Jeor): ${tmb} kcal — falta aplicar factor de actividad`)
  L.push(`- Objetivo declarado: ${guion(alta.objetivo)}`)
  L.push(`- Experiencia: ${guion(alta.experiencia)} · Ciclo pedido: ${guion(alta.duracionCiclo)}`)
  L.push(`- Contacto: ${guion(alta.whatsapp)} · ${guion(alta.email)}`)
  L.push('')

  L.push('## 2. Horarios')
  L.push(`- Días de entrenamiento: ${dias.length ? dias.join(', ') : '—'}`)
  for (const d of dias) L.push(`  · ${d}: ${guion(horarios[d])}`)
  L.push('- Comidas reales:')
  for (const c of COMIDAS) L.push(`  · ${c.label}: ${comidas[c.k] ?? 'no la hace'}`)
  L.push(`- Comidas que sostiene en día laboral: ${guion(alta.comidasSostenibles)}`)
  L.push(`- Entrena ${guion(alta.ayunas).toLowerCase()}`)
  L.push(`- Jornada variable: ${alta.jornadaVariable ? (alta.jornadaDetalle?.trim() || 'sí, sin detalle') : 'no'}`)
  L.push(`- Domingos: ${guion(alta.domingo)}`)
  L.push('')

  L.push('## 3. Ventana peri-entreno (derivada, no declarada)')
  const grupos = agruparPorHora(dias, horarios)
  if (!grupos.length) {
    L.push('- Sin horario de entrenamiento cargado. NO ubicar comidas hasta resolverlo.')
    flag('stop', 'Falta la hora de entrenamiento. Sin eso no se ubica ninguna toma.')
  }
  for (const g of grupos) {
    const p = peri(g.hora, comidas)
    const ds = g.dias.join(', ')
    if (!p.pre && !p.post) {
      L.push(`- ${ds} ${g.hora}: no hay comida en ventana. REPREGUNTAR.`)
      flag('stop', `El cliente entrena ${g.hora} y no hay ninguna comida en la ventana peri-entreno. Repreguntar antes de armar.`)
      continue
    }
    const pre  = p.pre  ? `${p.pre.nombre} (${p.pre.hora}, ${p.pre.minutos} min antes)` : 'ninguna en ventana'
    const post = p.post ? `${p.post.nombre} (${p.post.hora})` : 'ninguna en ventana'
    L.push(`- ${ds} ${g.hora} → PRE: ${pre} · POST: ${post}`)
    if (!p.pre || !p.post) {
      flag('stop', `El cliente entrena ${g.hora} y le falta la toma ${!p.pre ? 'PRE' : 'POST'} en ventana. REPREGUNTAR antes de armar nada.`)
    }
  }
  if (grupos.length > 1) {
    L.push('- Horarios distintos entre días: el plan necesita más de una plantilla.')
    flag('aviso', 'Entrena a distintas horas según el día: hacen falta dos plantillas de comidas.')
  }
  L.push('')

  L.push('## 4. Alimentación')
  L.push(`- Le cae mal: ${guion(alta.caeMal)}`)
  L.push(`- Alergias / intolerancias: ${guion(alta.alergias)}`)
  L.push(`- No come: ${guion(alta.noGusta)}`)
  L.push(`- Cocina: ${guion(alta.cocina)} · Afuera: ${guion(alta.comidasAfuera)}`)
  L.push(`- Balanza: ${guion(alta.balanza)}`)
  L.push(`- Fin de semana: ${guion(alta.finDeSemana)}`)
  L.push(`- Agua: ${guion(alta.agua)}`)
  L.push('')

  L.push('## 5. Salud')
  L.push(`- Lesión / condición: ${alta.lesion
    ? `${alta.lesionDetalle?.trim() || 'sí, sin detalle'} — estado: ${alta.lesionEstado?.trim() || 'sin especificar'}`
    : 'ninguna declarada'}`)
  L.push(`- Laboratorio 12 meses: ${guion(alta.laboratorio)}`)
  L.push(`- Medicación / suplementos: ${guion(alta.medicacion)}`)
  L.push(`- Sueño: ${guion(alta.sueno)} h · Estrés: ${guion(alta.estres)}`)
  L.push(`- Seguimiento profesional: ${guion(alta.seguimiento)}`)
  L.push('')

  L.push('## 6. Entrenamiento')
  L.push(`- Lugar: ${guion(alta.lugar)} · Equipamiento: ${guion(alta.equipamiento)}`)
  L.push(`- Sesiones conmigo: ${alta.sesionesConEntrenador ?? '0'} · Solo: ${alta.sesionesSolo ?? '0'}`)
  L.push(`- Tiempo por sesión: ${guion(alta.duracionSesion)} · Pasos/día: ${guion(alta.pasos)}`)
  L.push(`- Otros deportes: ${guion(alta.otrosDeportes)}`)
  L.push(`- Evitar: ${guion(alta.ejerciciosEvitar)}`)
  L.push('')

  L.push('## 7. Logística')
  L.push(`- Presupuesto suplementos: ${guion(alta.presupuestoSuplementos)}`)
  L.push(`- Revisión: ${guion(alta.revision)} · Comunicación: ${guion(alta.comunicacion)}`)
  L.push(`- Intentos previos: ${guion(alta.intentosPrevios)}`)
  L.push(`- Fecha motivadora: ${guion(alta.fechaMotivadora)}`)
  L.push('')

  L.push('## Instrucción al agente')
  L.push('Armar ciclo con gramajes exactos en crudo, sin medidas caseras. Ubicar las tomas según la ventana peri-entreno derivada arriba, no según el orden habitual de comidas. Si algún dato crítico figura como "—", preguntar antes de generar el documento.')

  // ── Alertas que no dependen de la derivación ──
  const declaradas = COMIDAS.filter(c => comidas[c.k]).length
  if (alta.comidasSostenibles && declaradas && alta.comidasSostenibles < declaradas) {
    flag('aviso', `Declara ${declaradas} comidas pero sostiene ${alta.comidasSostenibles} en día laboral: armar sobre ${alta.comidasSostenibles} tomas.`)
  }
  if (alta.jornadaVariable) {
    flag('aviso', 'Jornada variable declarada: hace falta una segunda plantilla de día.')
  }
  if (alta.balanza === 'No y no pienso comprarla') {
    flag('stop', 'No va a usar balanza. El plan en gramajes exactos no es ejecutable tal como se entrega: hablarlo antes de arrancar.')
  }
  if (alta.lesionEstado === 'Activa') {
    flag('stop', 'Lesión activa: excluir ejercicios y sumar alerta clínica. Verificar seguimiento médico.')
  }
  if (alta.laboratorio === 'Sí, los tengo') {
    flag('ok', 'Tiene laboratorio reciente: pedírselo por WhatsApp antes de armar.')
  }
  if (alta.ayunas === 'En ayunas') {
    flag('aviso', 'Entrena en ayunas: el pre-entreno es una toma rápida, no una comida completa.')
  }
  if (!alertas.length) {
    flag('ok', 'Sin alertas. Los ocho datos críticos están cargados.')
  }

  return { alertas, prompt: L.join('\n'), tmb }
}

/** Datos crudos agrupados por paso, para la vista interna. */
export function datosCrudos(alta: AltaFicha): { paso: string; filas: [string, string][] }[] {
  const comidas = alta.horariosComidas ?? {}
  const horarios = alta.horariosEntrenamiento ?? {}
  return [
    {
      paso: 'Quién sos',
      filas: [
        ['Nombre', guion(alta.nombre)],
        ['Email', guion(alta.email)],
        ['WhatsApp', guion(alta.whatsapp)],
        ['Edad', guion(alta.edad)],
        ['Sexo', guion(alta.sexo)],
        ['Peso', `${guion(alta.pesoKg)} kg`],
        ['Altura', `${guion(alta.alturaCm)} cm`],
        ['Objetivo', guion(alta.objetivo)],
        ['Experiencia', guion(alta.experiencia)],
        ['Ciclo pedido', guion(alta.duracionCiclo)],
      ],
    },
    {
      paso: 'Tus horarios',
      filas: [
        ['Días', (alta.diasEntrenamiento ?? []).join(', ') || '—'],
        ...(alta.diasEntrenamiento ?? []).map(d => [`Hora ${d}`, guion(horarios[d])] as [string, string]),
        ...COMIDAS.map(c => [c.label, comidas[c.k] ?? 'no la hace'] as [string, string]),
        ['Comidas que sostiene', guion(alta.comidasSostenibles)],
        ['Ayunas', guion(alta.ayunas)],
        ['Jornada variable', alta.jornadaVariable ? guion(alta.jornadaDetalle) : 'no'],
        ['Domingos', guion(alta.domingo)],
      ],
    },
    {
      paso: 'Cómo comés',
      filas: [
        ['Le cae mal', guion(alta.caeMal)],
        ['Alergias', guion(alta.alergias)],
        ['No le gusta', guion(alta.noGusta)],
        ['Cocina', guion(alta.cocina)],
        ['Comidas afuera', guion(alta.comidasAfuera)],
        ['Balanza', guion(alta.balanza)],
        ['Fin de semana', guion(alta.finDeSemana)],
        ['Agua', guion(alta.agua)],
      ],
    },
    {
      paso: 'Salud',
      filas: [
        ['Lesión', alta.lesion ? guion(alta.lesionDetalle) : 'no'],
        ['Estado de la lesión', guion(alta.lesionEstado)],
        ['Laboratorio', guion(alta.laboratorio)],
        ['Medicación', guion(alta.medicacion)],
        ['Sueño', guion(alta.sueno)],
        ['Estrés', guion(alta.estres)],
        ['Seguimiento', guion(alta.seguimiento)],
      ],
    },
    {
      paso: 'Cómo vas a entrenar',
      filas: [
        ['Lugar', guion(alta.lugar)],
        ['Equipamiento', guion(alta.equipamiento)],
        ['Sesiones conmigo', guion(alta.sesionesConEntrenador)],
        ['Sesiones solo', guion(alta.sesionesSolo)],
        ['Duración de sesión', guion(alta.duracionSesion)],
        ['Otros deportes', guion(alta.otrosDeportes)],
        ['Ejercicios a evitar', guion(alta.ejerciciosEvitar)],
        ['Pasos por día', guion(alta.pasos)],
      ],
    },
    {
      paso: 'Cómo seguimos',
      filas: [
        ['Presupuesto suplementos', guion(alta.presupuestoSuplementos)],
        ['Revisión', guion(alta.revision)],
        ['Comunicación', guion(alta.comunicacion)],
        ['Intentos previos', guion(alta.intentosPrevios)],
        ['Fecha motivadora', guion(alta.fechaMotivadora)],
      ],
    },
  ]
}
