// Ficha de un cliente que se registró por la web (registro → /onboarding).
//
// Mismo formato que la ficha de /ingreso (src/lib/ficha.ts): alertas arriba y
// un bloque de texto plano para copiar al armado. Se usa en el mail que recibe
// el entrenador cuando alguien completa el onboarding.
//
// El onboarding no pide horarios exactos de comidas, así que acá no hay
// derivación peri-entreno: solo la franja horaria en la que entrena.

import type { OnboardingData, IGZResult } from '@/types'
import type { Alerta, TipoAlerta } from './ficha'
import {
  etiqueta, etiquetas, OBSTACULOS, HORARIOS_ENTRENAMIENTO, FRECUENCIA_COME_AFUERA,
  LUGARES_COME_AFUERA, SESIONES_COCINA, SUPERMERCADOS, requiereGuiaComerAfuera,
} from './cuestionario'

export interface ClienteFicha {
  nombre: string
  email: string
  creadoEn: Date | string
  perfil: OnboardingData
  igz: IGZResult
}

const GENERO    = { MASCULINO: 'Masculino', FEMENINO: 'Femenino' } as Record<string, string>
const OBJETIVO  = { VOLUMEN: 'Volumen', DEFINICION: 'Definición', RECOMPOSICION: 'Recomposición' } as Record<string, string>
const NIVEL     = { BAJO: 'Bajo', MEDIO: 'Medio', ALTO: 'Alto', BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' } as Record<string, string>
const DOMINGO   = { siempre: 'Sí, siempre', aveces: 'A veces', no: 'No' } as Record<string, string>
const EXPERIENCIA = {
  ninguna: 'Sin experiencia', principiante: 'Principiante (< 1 año)',
  intermedio: 'Intermedio (1 a 3 años)', avanzado: 'Avanzado (> 3 años)',
} as Record<string, string>

const guion = (v: unknown) => {
  if (v === null || v === undefined) return '—'
  const t = String(v).trim()
  return t === '' ? '—' : t
}
const lista = (v?: string[] | null) => (v?.length ? v.join(', ') : '—')
const de = (mapa: Record<string, string>, v?: string | null) => (v ? mapa[v] ?? v : '—')

function fechaAR(d: Date | string) {
  const fecha = typeof d === 'string' ? new Date(d) : d
  return fecha.toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })
}

export function construirFichaCliente(c: ClienteFicha): { alertas: Alerta[]; prompt: string } {
  const p = c.perfil
  const alertas: Alerta[] = []
  const flag = (tipo: TipoAlerta, texto: string) => alertas.push({ tipo, texto })
  const L: string[] = []

  const lesionesActuales = [...(p.lesionesActuales ?? []), ...(p.lesiones?.trim() ? [p.lesiones.trim()] : [])]

  L.push(`# NUEVO CLIENTE RE-VIVA — ${guion(c.nombre)}`)
  L.push(`Recibido: ${fechaAR(c.creadoEn)} · Canal: registro web + onboarding`)
  L.push('')

  L.push('## 1. Perfil')
  L.push(`- Edad: ${guion(p.edad)} · Sexo: ${de(GENERO, p.genero)} · Peso: ${guion(p.peso)} kg · Altura: ${guion(p.altura)} cm`)
  L.push(`- Objetivo: ${de(OBJETIVO, p.objetivo)}`)
  L.push(`- Resultado soñado: ${guion(p.resultadoSonado)}`)
  L.push(`- Obstáculos: ${etiquetas(OBSTACULOS, p.obstaculos)}`)
  L.push(`- Experiencia: ${de(EXPERIENCIA, p.experiencia)} · Actividad laboral: ${guion(p.actividadLaboral)}`)
  L.push(`- Contacto: ${guion(c.email)}`)
  L.push('')

  L.push('## 2. Pre-cálculo Motor IGZ (guía, no definitivo)')
  L.push(`- Clasificación: ${c.igz.clasificacion}`)
  L.push(`- ${c.igz.calorias} kcal · P ${c.igz.proteina} g · H ${c.igz.hidratos} g · G ${c.igz.grasas} g`)
  L.push('')

  L.push('## 3. Horarios')
  L.push(`- Días de entrenamiento: ${guion(p.diasEntrenamiento)} por semana`)
  L.push(`- Franja de entrenamiento: ${etiqueta(HORARIOS_ENTRENAMIENTO, p.horarioEntrenamiento)}`)
  if (p.diasEntrenamiento === 3) L.push(`- Domingo disponible: ${de(DOMINGO, p.disponibilidadDomingo)}`)
  L.push(`- Comidas por día: ${guion(p.comidasPorDia)} · Minutos por sesión: ${guion(p.minutosPorSesion)}`)
  L.push('')

  L.push('## 4. Alimentación')
  L.push(`- Estilo / preferencias: ${guion(p.preferenciasAlimentarias)}`)
  L.push(`- Alergias: ${lista(p.alergias)} · Intolerancias: ${lista(p.intolerancias)}`)
  L.push(`- No consume: ${lista(p.alimentosQueNoConsume)}`)
  L.push(`- Come afuera: ${etiqueta(FRECUENCIA_COME_AFUERA, p.comeAfuera)}${p.lugaresComeAfuera?.length ? ` (${etiquetas(LUGARES_COME_AFUERA, p.lugaresComeAfuera)})` : ''}`)
  L.push(`- Cocina: ${etiqueta(SESIONES_COCINA, p.sesionesCocina)}`)
  L.push(`- Supermercado: ${etiqueta(SUPERMERCADOS, p.supermercado)}`)
  L.push('')

  L.push('## 5. Salud')
  L.push(`- Lesiones actuales: ${lista(lesionesActuales)} · Pasadas: ${lista(p.lesionesPasadas)}`)
  L.push(`- Condiciones médicas: ${lista(p.condicionesMedicasDeclaradas)}`)
  L.push(`- Medicación: ${lista(p.medicacionActual)} · Suplementos actuales: ${lista(p.suplementosActuales)}`)
  L.push(`- Sueño: ${guion(p.horasSueno)} h · Estrés: ${de(NIVEL, p.nivelEstres)} · Adherencia: ${de(NIVEL, p.adherencia)}`)
  L.push('')

  L.push('## 6. Entrenamiento')
  L.push(`- Equipamiento: ${lista(p.equipamiento)}`)
  L.push(`- Deportes: ${p.practicaDeportes ? lista(p.deportes) : 'no practica'}${p.quiereMejorarDeporte ? ` · Quiere mejorar: ${p.quiereMejorarDeporte}` : ''}`)
  L.push(`- Metas físicas: ${lista(p.metasFisicas)}`)
  L.push('')

  L.push('## Instrucción al agente')
  L.push('Armar ciclo con gramajes exactos (proteínas cocidas, hidratos crudos), sin medidas caseras salvo en la Guía para comer afuera. Ubicar pre y post entreno según la franja horaria declarada; si hace falta la hora exacta, preguntarla. Si algún dato crítico figura como "—", preguntar antes de generar el documento.')

  // ── Alertas ──
  const consentimientosOk =
    p.aceptaTerminosYCondiciones === true && p.aceptaPoliticaPrivacidad === true &&
    p.aceptaDescargoMedicoYResponsabilidad === true && p.confirmaVeracidadDatos === true
  if (!consentimientosOk) {
    flag('stop', 'No aceptó todos los consentimientos legales: hablarlo antes de activar el plan.')
  }
  if (lesionesActuales.length) {
    flag('stop', `Lesión actual declarada (${lesionesActuales.join(', ')}): excluir ejercicios y verificar seguimiento médico.`)
  }
  if (p.condicionesMedicasDeclaradas?.length || p.medicacionActual?.length) {
    flag('aviso', 'Declara condiciones médicas o medicación: revisar antes de armar.')
  }
  if (typeof p.edad === 'number' && p.edad >= 65) {
    flag('aviso', 'Tiene 65 años o más: ajustar volumen e intensidad.')
  }
  if (requiereGuiaComerAfuera(p.comeAfuera)) {
    flag('aviso', 'Come afuera 3 o más veces por semana: sumar la Guía para comer afuera.')
  }
  if (p.sesionesCocina === 'no_cocino') {
    flag('aviso', 'No cocina: meal prep mínimo y ofrecer el nivel "Lo hago por vos".')
  }
  if (p.diasEntrenamiento === 3) {
    flag('ok', p.disponibilidadDomingo === 'siempre'
      ? 'Entrena 3x: FBEOD + DUP, puede rotar incluyendo domingo.'
      : 'Entrena 3x: FBEOD + DUP en Lunes / Miércoles / Viernes.')
  }
  if (p.objetivo === 'RECOMPOSICION' && (p.experiencia === 'ninguna' || p.experiencia === 'principiante')) {
    flag('aviso', 'Recomposición con poca experiencia: verificar tolerancia antes de aplicar FBEOD completo.')
  }
  if (!alertas.length) {
    flag('ok', 'Sin alertas.')
  }

  return { alertas, prompt: L.join('\n') }
}
