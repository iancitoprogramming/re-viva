// Re-Viva by IGZ Trainer - Tipos de datos compartidos en toda la app

export type Genero = 'MASCULINO' | 'FEMENINO'
export type Objetivo = 'VOLUMEN' | 'DEFINICION' | 'RECOMPOSICION'
export type NivelEstres = 'BAJO' | 'MEDIO' | 'ALTO'
export type Adherencia = 'BAJA' | 'MEDIA' | 'ALTA'
export type EstadoPlan = 'PENDIENTE' | 'ACTIVO' | 'ARCHIVADO'
export type Clasificacion = 'VOLUMEN' | 'DEFINICION' | 'RECOMPOSICION'

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
