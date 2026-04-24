// Fixtures para tests del pipeline y proofreader.
// Perfil base "feliz" (cliente intermedio sano) + variantes con distintos flags.

import type { ClientProfile, GeneratedPlan, ProcessedContext } from '../../src/lib/plans/types';

export function perfilBase(over: Partial<ClientProfile> = {}): ClientProfile {
  const base: ClientProfile = {
    id: 'u_test_001',
    nombre: 'Cliente Test',
    email: 'test@reviva.ar',
    fechaNacimiento: '1990-01-15',
    genero: 'masculino',
    pesoKg: 80,
    alturaCm: 178,
    objetivoPrincipal: 'recomposicion',
    diasPorSemana: 4,
    minutosPorSesion: 60,
    nivelExperiencia: 'intermedio',
    lugarEntrenamiento: 'gimnasio',
    equipamientoDisponible: ['gym'],
    alergias: [],
    intolerancias: [],
    alimentosQueNoConsume: [],
    comidasPorDia: 4,
    condicionesMedicasDeclaradas: [],
    lesionesActuales: [],
    lesionesPasadas: [],
    medicacionActual: [],
    nivelEstres: 3,
    horasSuenoPromedio: 7,
    consentimientos: {
      aceptaTerminosYCondiciones: true,
      aceptaPoliticaPrivacidad: true,
      aceptaDescargoMedicoYResponsabilidad: true,
      confirmaVeracidadDatos: true,
      fechaAceptacion: '2026-04-01T10:00:00Z',
      ipAceptacion: '127.0.0.1',
    },
  };
  return { ...base, ...over };
}

// Un ProcessedContext típico para un perfil base (valores aproximados)
export function ctxBase(over: Partial<ProcessedContext> = {}): ProcessedContext {
  const base: ProcessedContext = {
    edadAnios: 36,
    imc: 25.2,
    imcCategoria: 'Sobrepeso',
    bmr: 1745,
    factorActividad: 1.55,
    tdee: 2704,
    caloriasObjetivo: 2704,
    ajusteCaloricoDesc: 'Mantenimiento',
    macrosObjetivo: {
      proteinaGMin: 128,
      proteinaGMax: 176,
      grasaGMin: 64,
      grasaGMax: 96,
      carbosG: 316,
      proteinaPct: 23,
      carbosPct: 47,
      grasaPct: 30,
    },
    volumenSemanal: {
      seriesMin: 12,
      seriesMax: 18,
      descripcion: '12–18 series/semana por grupo muscular',
    },
    distribucionDias: 'Upper/Lower x2 o PPL + Full body',
    flagsAltoRiesgo: [],
    requiereRevisionManualObligatoria: false,
  };
  return { ...base, ...over };
}

// Un plan generado "correcto" que debería pasar todos los checks
export function planValido(over: Partial<GeneratedPlan> = {}): GeneratedPlan {
  const base: GeneratedPlan = {
    planId: 'plan_test_001',
    clientId: 'u_test_001',
    generatedAt: '2026-04-22T10:00:00Z',
    version: 1,
    resumenEjecutivo: {
      objetivo: 'Recomposición corporal manteniendo calorías y subiendo calidad del entrenamiento.',
      caloriesDiarias: 2700,
      macros: { proteinaG: 160, carbosG: 290, grasaG: 75 },
      hidratacionL: 2.8,
      diasEntrenamiento: 4,
      volumenSemanalResumen: {
        pecho: 14,
        espalda: 16,
        hombros: 12,
        biceps: 12,
        triceps: 12,
        cuadriceps: 14,
        gluteos: 14,
        isquiotibiales: 12,
        abdomen: 10,
      },
    },
    planEntrenamiento: {
      distribucionSemanal: [
        {
          dia: 1,
          nombre: 'Día 1 — Upper',
          gruposObjetivo: ['pecho', 'espalda', 'hombros'],
          duracionEstimadaMin: 60,
          calentamiento: ['5 min bici', 'movilidad'],
          ejercicios: [
            { nombre: 'Press de banca con barra', grupoMuscular: 'pecho', series: 4, repeticiones: '8-10', rir: 2, descansoSeg: 90 },
            { nombre: 'Remo con barra', grupoMuscular: 'espalda', series: 4, repeticiones: '8-10', rir: 2, descansoSeg: 90 },
            { nombre: 'Press militar con mancuernas', grupoMuscular: 'hombros', series: 3, repeticiones: '10-12', rir: 2, descansoSeg: 75 },
            { nombre: 'Curl con mancuernas', grupoMuscular: 'biceps', series: 3, repeticiones: '10-12', rir: 1, descansoSeg: 60 },
          ],
          vuelta_a_la_calma: ['estiramiento'],
          notasInstructor: 'RIR 1-3',
        },
        {
          dia: 2,
          nombre: 'Día 2 — Lower',
          gruposObjetivo: ['cuadriceps', 'gluteos', 'isquiotibiales'],
          duracionEstimadaMin: 60,
          calentamiento: ['5 min bici', 'movilidad cadera'],
          ejercicios: [
            { nombre: 'Sentadilla con barra', grupoMuscular: 'cuadriceps', series: 4, repeticiones: '8-10', rir: 2, descansoSeg: 120 },
            { nombre: 'Hip thrust', grupoMuscular: 'gluteos', series: 4, repeticiones: '10-12', rir: 2, descansoSeg: 90 },
            { nombre: 'Curl femoral en máquina', grupoMuscular: 'isquiotibiales', series: 3, repeticiones: '12-15', rir: 1, descansoSeg: 60 },
          ],
          vuelta_a_la_calma: ['estiramiento'],
          notasInstructor: 'Cuidar técnica en sentadilla',
        },
        {
          dia: 3,
          nombre: 'Día 3 — Upper Pull',
          gruposObjetivo: ['espalda', 'biceps'],
          duracionEstimadaMin: 60,
          calentamiento: ['5 min bici'],
          ejercicios: [
            { nombre: 'Dominadas', grupoMuscular: 'espalda', series: 4, repeticiones: '6-10', rir: 2, descansoSeg: 90 },
            { nombre: 'Jalón al pecho en polea', grupoMuscular: 'espalda', series: 3, repeticiones: '10-12', rir: 2, descansoSeg: 75 },
            { nombre: 'Curl martillo', grupoMuscular: 'biceps', series: 3, repeticiones: '10-12', rir: 1, descansoSeg: 60 },
          ],
          vuelta_a_la_calma: ['estiramiento'],
          notasInstructor: 'RIR 1-2',
        },
        {
          dia: 4,
          nombre: 'Día 4 — Upper Push',
          gruposObjetivo: ['pecho', 'hombros', 'triceps'],
          duracionEstimadaMin: 60,
          calentamiento: ['5 min bici'],
          ejercicios: [
            { nombre: 'Press inclinado con mancuernas', grupoMuscular: 'pecho', series: 4, repeticiones: '8-10', rir: 2, descansoSeg: 90 },
            { nombre: 'Vuelos laterales con mancuernas', grupoMuscular: 'hombros', series: 4, repeticiones: '12-15', rir: 1, descansoSeg: 60 },
            { nombre: 'Extensiones de tríceps en polea', grupoMuscular: 'triceps', series: 4, repeticiones: '10-12', rir: 2, descansoSeg: 60 },
          ],
          vuelta_a_la_calma: ['estiramiento'],
          notasInstructor: 'Mantener progresión',
        },
      ],
      parametrosGlobales: {
        intensidadPct1RM: '65-80%',
        rirObjetivo: '1-3 repeticiones en reserva',
        progresionSemanal: 'subir 2.5kg cuando se completan todas las series',
        referenciaCientifica: 'ACSM Position Stand 2025 (PMC12965823)',
      },
    },
    planNutricional: {
      estrategiaCalorica: 'Mantenimiento calórico con foco en proteína',
      distribucionMacros: { proteinaPct: 24, carbosPct: 43, grasaPct: 25 },
      timingPeriEntrenamiento: 'Proteína + carbos 1h antes y después',
      ejemploDiaTipo: [
        {
          comida: 'Desayuno',
          hora: '08:00',
          ingredientes: [
            { nombre: 'avena', cantidadG: 80, proteinaG: 10, carbosG: 54, grasaG: 6, kcal: 310 },
            { nombre: 'huevo entero', cantidadG: 100, proteinaG: 13, carbosG: 1, grasaG: 11, kcal: 155 },
          ],
          totalesComida: { proteinaG: 23, carbosG: 55, grasaG: 17, kcal: 465 },
        },
        {
          comida: 'Almuerzo',
          hora: '13:00',
          ingredientes: [
            { nombre: 'pollo pechuga', cantidadG: 200, proteinaG: 62, carbosG: 0, grasaG: 7, kcal: 311 },
            { nombre: 'arroz blanco cocido', cantidadG: 250, proteinaG: 7, carbosG: 70, grasaG: 1, kcal: 325 },
            { nombre: 'brocoli', cantidadG: 150, proteinaG: 4, carbosG: 10, grasaG: 1, kcal: 65 },
          ],
          totalesComida: { proteinaG: 73, carbosG: 80, grasaG: 9, kcal: 701 },
        },
        {
          comida: 'Merienda',
          hora: '17:00',
          ingredientes: [
            { nombre: 'yogur griego', cantidadG: 200, proteinaG: 20, carbosG: 7, grasaG: 10, kcal: 208 },
            { nombre: 'almendras', cantidadG: 30, proteinaG: 6, carbosG: 7, grasaG: 15, kcal: 187 },
          ],
          totalesComida: { proteinaG: 26, carbosG: 14, grasaG: 25, kcal: 395 },
        },
        {
          comida: 'Cena',
          hora: '21:00',
          ingredientes: [
            { nombre: 'carne vacuna magra', cantidadG: 180, proteinaG: 49, carbosG: 0, grasaG: 13, kcal: 312 },
            { nombre: 'papa', cantidadG: 300, proteinaG: 6, carbosG: 51, grasaG: 0, kcal: 231 },
            { nombre: 'aceite de oliva', cantidadG: 10, proteinaG: 0, carbosG: 0, grasaG: 10, kcal: 88 },
            { nombre: 'tomate', cantidadG: 150, proteinaG: 1, carbosG: 6, grasaG: 0, kcal: 30 },
          ],
          totalesComida: { proteinaG: 56, carbosG: 57, grasaG: 23, kcal: 661 },
        },
      ],
      listaCompras: [
        { categoria: 'Proteínas', items: ['pollo pechuga 1.5kg', 'carne magra 1kg'] },
      ],
      hidratacion: 'Tomar ~2.8 litros de agua al día.',
      suplementacion: [
        {
          nombre: 'Creatina monohidratada',
          dosis: '5g',
          timing: 'post-entrenamiento',
          evidencia: 'Mejora fuerza y potencia (Kreider et al., 2017)',
        },
        {
          nombre: 'Whey protein concentrada',
          dosis: '30g',
          timing: 'post-entrenamiento',
          evidencia: 'Acelera la síntesis proteica post-ejercicio (Morton et al., 2018)',
        },
      ],
    },
    metaInfo: {
      modeloUsado: 'claude-haiku-4-5-20251001',
      costoGeneracionUSD: 0.02,
      requiereRevisionManualObligatoria: false,
      flagsDetectados: [],
    },
  };
  return { ...base, ...over };
}
