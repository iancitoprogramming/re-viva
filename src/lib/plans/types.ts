// ─── ENTRADA AL PIPELINE ──────────────────────────────────────────────────────

export type FlagEspecial =
  | 'perimenopausia'
  | 'embarazo'
  | 'postparto'
  | 'lumbar_cronico'
  | 'adulto_mayor_65plus'
  | 'deportista_competitivo';

export type ObjetivoPrincipal =
  | 'perdida_grasa'
  | 'ganancia_muscular'
  | 'recomposicion'
  | 'mantenimiento'
  | 'rendimiento_deportivo'
  | 'salud_general';

export type NivelExperiencia = 'principiante' | 'intermedio' | 'avanzado';
export type LugarEntrenamiento = 'gimnasio' | 'casa' | 'mixto' | 'aire_libre';
export type PreferenciaDieta = 'omnivora' | 'vegetariana' | 'vegana';

export interface ClientProfile {
  // Identidad
  id: string;
  nombre: string;
  email: string;
  fechaNacimiento: string; // ISO date YYYY-MM-DD
  genero: 'masculino' | 'femenino';

  // Datos antropométricos
  pesoKg: number;
  alturaCm: number;
  circunferenciaCinturaCm?: number;
  porcentajeGrasaEstimado?: number;

  // Objetivo
  objetivoPrincipal: ObjetivoPrincipal;
  objetivoSecundario?: string;
  plazoObjetivoSemanas?: number;

  // Entrenamiento
  diasPorSemana: 1 | 2 | 3 | 4 | 5 | 6;
  minutosPorSesion: number;
  nivelExperiencia: NivelExperiencia;
  lugarEntrenamiento: LugarEntrenamiento;
  equipamientoDisponible: string[];

  // Nutrición
  preferenciaDieta?: PreferenciaDieta;
  alergias: string[];
  intolerancias: string[];
  alimentosQueNoConsume: string[];
  comidasPorDia: number;
  presupuestoSemanalARS?: number;

  // Salud
  condicionesMedicasDeclaradas: string[];
  lesionesActuales: string[];
  lesionesPasadas: string[];
  medicacionActual: string[];

  // Contexto
  nivelEstres: 1 | 2 | 3 | 4 | 5;
  horasSuenoPromedio: number;
  notasAdicionales?: string;

  // Plantillas condicionales
  flagsEspeciales?: FlagEspecial[];

  // Consentimientos (todos deben ser true)
  consentimientos: {
    aceptaTerminosYCondiciones: boolean;
    aceptaPoliticaPrivacidad: boolean;
    aceptaDescargoMedicoYResponsabilidad: boolean;
    confirmaVeracidadDatos: boolean;
    fechaAceptacion: string; // ISO datetime
    ipAceptacion: string;
  };
}

// ─── CONTEXTO CALCULADO (etapa 2) ────────────────────────────────────────────

export interface ProcessedContext {
  edadAnios: number;
  imc: number;
  imcCategoria: string;
  bmr: number;
  factorActividad: number;
  tdee: number;
  caloriasObjetivo: number;
  ajusteCaloricoDesc: string;
  macrosObjetivo: {
    proteinaGMin: number;
    proteinaGMax: number;
    grasaGMin: number;
    grasaGMax: number;
    carbosG: number; // residual después de proteína y grasa
    proteinaPct: number;
    carbosPct: number;
    grasaPct: number;
  };
  volumenSemanal: {
    seriesMin: number;
    seriesMax: number;
    descripcion: string;
  };
  distribucionDias: string;
  flagsAltoRiesgo: string[];
  requiereRevisionManualObligatoria: boolean;
}

// ─── PLAN GENERADO (salida del motor) ────────────────────────────────────────

export interface Ingrediente {
  nombre: string;
  cantidadG: number;
  proteinaG: number;
  carbosG: number;
  grasaG: number;
  kcal: number;
}

export interface TotalesComida {
  proteinaG: number;
  carbosG: number;
  grasaG: number;
  kcal: number;
}

export interface ComidaDiaTipo {
  comida: string;
  hora: string;
  ingredientes: Ingrediente[];
  totalesComida: TotalesComida;
}

export interface Ejercicio {
  nombre: string;
  grupoMuscular: string;
  series: number;
  repeticiones: string; // "8-12"
  intensidadPct1RM?: number;
  rir: number;
  descansoSeg: number;
  tecnicaNotas?: string;
  alertas?: string[];
  sustitutoEnCasa?: string;
}

export interface DiaEntrenamiento {
  dia: number;
  nombre: string;
  gruposObjetivo: string[];
  duracionEstimadaMin: number;
  calentamiento: string[];
  ejercicios: Ejercicio[];
  vuelta_a_la_calma: string[];
  notasInstructor: string;
}

export interface Suplemento {
  nombre: string;
  dosis: string;
  timing: string;
  evidencia: string;
}

export interface GeneratedPlan {
  planId: string;
  clientId: string;
  generatedAt: string;
  version: number;

  resumenEjecutivo: {
    objetivo: string;
    caloriesDiarias: number;
    macros: { proteinaG: number; carbosG: number; grasaG: number };
    hidratacionL: number;
    diasEntrenamiento: number;
    volumenSemanalResumen: Record<string, number>;
  };

  planEntrenamiento: {
    distribucionSemanal: DiaEntrenamiento[];
    parametrosGlobales: {
      intensidadPct1RM: string;
      rirObjetivo: string;
      progresionSemanal: string;
      referenciaCientifica: string;
    };
  };

  planNutricional: {
    estrategiaCalorica: string;
    distribucionMacros: { proteinaPct: number; carbosPct: number; grasaPct: number };
    timingPeriEntrenamiento: string;
    ejemploDiaTipo: ComidaDiaTipo[];
    listaCompras: Array<{ categoria: string; items: string[] }>;
    hidratacion: string;
    suplementacion: Suplemento[];
    seccionesEspeciales?: string[];
  };

  metaInfo: {
    modeloUsado: string;
    costoGeneracionUSD: number;
    requiereRevisionManualObligatoria: boolean;
    flagsDetectados: string[];
  };
}

// ─── RESULTADO DEL PIPELINE ───────────────────────────────────────────────────

export type PipelineStatus =
  | 'queued_alta_prioridad'
  | 'queued_revision'
  | 'error_intake'
  | 'error_engine'
  | 'blocked_consents';

export interface PipelineResult {
  status: PipelineStatus;
  planId?: string;
  reviewId?: string;
  error?: string;
  requiereRevisionManual?: boolean;
}

// ─── ERRORES DE INTAKE ────────────────────────────────────────────────────────

export interface IntakeValidationError {
  campo: string;
  mensaje: string;
}

export interface IntakeValidationResult {
  valido: boolean;
  errores: IntakeValidationError[];
}
