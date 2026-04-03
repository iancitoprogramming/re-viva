// Re-Viva by IGZ Trainer - Tipos de datos compartidos en toda la app

export type Genero = 'MASCULINO' | 'FEMENINO'
export type Objetivo = 'VOLUMEN' | 'DEFINICION' | 'RECOMPOSICION'
export type NivelEstres = 'BAJO' | 'MEDIO' | 'ALTO'
export type Adherencia = 'BAJA' | 'MEDIA' | 'ALTA'
export type EstadoPlan = 'PENDIENTE' | 'ACTIVO' | 'ARCHIVADO'
export type Clasificacion = 'VOLUMEN' | 'DEFINICION' | 'RECOMPOSICION'
export type TipoCheckIn = 'rutina' | 'suplemento' | 'peso' | 'foto' | 'medidas' | 'hidratacion'
export type TipoArchivo = 'rutina' | 'alimentacion' | 'suplementacion' | 'meal_prep' | 'otro'

// Datos que llegan del formulario de onboarding
export interface OnboardingData {
  genero: Genero
  edad: number
  altura: number
  peso: number
  objetivo: Objetivo
  diasEntrenamiento: number
  nivelEstres: NivelEstres
  horasSueno: number
  adherencia: Adherencia
  preferenciasAlimentarias?: string
  lesiones?: string
  fechaNacimiento?: string

  // Campos extendidos
  experiencia?: string
  equipamiento?: string[]
  actividadLaboral?: string
  practicaDeportes?: boolean
  deportes?: string[]
  quiereMejorarDeporte?: string
  metasFisicas?: string[]
}

// Resultado del motor IGZ
export interface IGZResult {
  clasificacion: Clasificacion
  calorias: number
  proteina: number
  hidratos: number
  grasas: number
}

// Usuario autenticado (lo que guardamos en el JWT)
export interface JWTPayload {
  userId: string
  email: string
  nombre: string
}

// Check-in del cliente
export interface CheckInData {
  id: string
  tipo: TipoCheckIn
  fecha: string
  nota?: string | null
  confirmado: boolean
}

// Archivo subido por el trainer
export interface ArchivoData {
  id: string
  nombre: string
  tipo: TipoArchivo
  nombreOriginal: string
  tamano: number
  subidoEn: string
}

// Entrada del leaderboard
export interface LeaderboardEntry {
  userId: string
  nombre: string
  totalCheckins: number
  rachaActual: number
  rachaMaxima: number
  consistenciaSemanal: number // checkins esta semana
  puntaje: number             // puntaje compuesto
  posicion: number
}
