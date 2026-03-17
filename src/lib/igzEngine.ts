// Motor IGZ - Clasificación y cálculo nutricional
// Este es el núcleo del negocio: clasifica al cliente y calcula sus macros

import type { OnboardingData, Clasificacion, IGZResult } from '@/types'

// ─── CLASIFICACIÓN ────────────────────────────────────────────────────────────
// Determina si el cliente debe hacer volumen, definición o recomposición
// basado en su objetivo, estrés, sueño y adherencia
function clasificar(data: OnboardingData): Clasificacion {
  let score = 0

  // El objetivo declarado pesa más
  if (data.objetivo === 'VOLUMEN')      score += 3
  if (data.objetivo === 'RECOMPOSICION') score += 0
  if (data.objetivo === 'DEFINICION')   score -= 3

  // Estrés alto y poco sueño reducen la capacidad de ganar músculo
  if (data.nivelEstres === 'ALTO')  score -= 1.5
  if (data.nivelEstres === 'BAJO')  score += 0.5
  if (data.horasSueno < 6)          score -= 1.5
  if (data.horasSueno >= 8)         score += 0.5

  // Baja adherencia: recomposición es más sostenible
  if (data.adherencia === 'BAJA')  score -= 1.5
  if (data.adherencia === 'ALTA')  score += 0.5

  // Más días de entrenamiento = más capacidad de volumen
  if (data.diasEntrenamiento >= 5) score += 0.5
  if (data.diasEntrenamiento <= 2) score -= 0.5

  if (score >= 2)    return 'VOLUMEN'
  if (score <= -1.5) return 'DEFINICION'
  return 'RECOMPOSICION'
}

// ─── METABOLISMO BASAL (BMR) ──────────────────────────────────────────────────
// Fórmula Mifflin-St Jeor: la más precisa para calcular calorías base
function calcularBMR(data: OnboardingData): number {
  const base = 10 * data.peso + 6.25 * data.altura - 5 * data.edad
  return data.genero === 'MASCULINO' ? base + 5 : base - 161
}

// ─── FACTOR DE ACTIVIDAD ──────────────────────────────────────────────────────
function factorActividad(dias: number): number {
  if (dias <= 1) return 1.2    // Sedentario
  if (dias <= 3) return 1.375  // Ligeramente activo
  if (dias <= 5) return 1.55   // Moderadamente activo
  return 1.725                 // Muy activo
}

// ─── DISTRIBUCIÓN DE MACROS ───────────────────────────────────────────────────
// Porcentajes por protocolo:
// Volumen:       Proteína 30% / Hidratos 50% / Grasas 20%
// Definición:    Proteína 40% / Hidratos 30% / Grasas 30%
// Recomposición: Proteína 35% / Hidratos 40% / Grasas 25%
function calcularMacros(calorias: number, clasificacion: Clasificacion) {
  const pcts = {
    VOLUMEN:       { p: 0.30, h: 0.50, g: 0.20 },
    DEFINICION:    { p: 0.40, h: 0.30, g: 0.30 },
    RECOMPOSICION: { p: 0.35, h: 0.40, g: 0.25 },
  }[clasificacion]

  return {
    proteina: Math.round((calorias * pcts.p) / 4), // 4 kcal por gramo
    hidratos: Math.round((calorias * pcts.h) / 4), // 4 kcal por gramo
    grasas:   Math.round((calorias * pcts.g) / 9), // 9 kcal por gramo
  }
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────
// Recibe el perfil completo y devuelve clasificación + calorías + macros
export function correrMotorIGZ(data: OnboardingData): IGZResult {
  const clasificacion = clasificar(data)
  const bmr = calcularBMR(data)
  const tdee = bmr * factorActividad(data.diasEntrenamiento)

  // Ajuste calórico según protocolo
  let calorias: number
  if (clasificacion === 'VOLUMEN')    calorias = Math.round(tdee + 350)
  else if (clasificacion === 'DEFINICION') calorias = Math.round(tdee - 400)
  else                                calorias = Math.round(tdee)

  const macros = calcularMacros(calorias, clasificacion)

  return { clasificacion, calorias, ...macros }
}
