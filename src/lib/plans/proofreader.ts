// Proofreader automático — valida planes generados por el motor IGZ
// sin realizar una segunda llamada a la API (todas las validaciones son
// programáticas y deterministas).
//
// Implementa los 20 checks del spec:
// - Matemáticos: 1-6 (kcal por ingrediente, suma de comidas, rangos de macros)
// - Ingredientes vs DB: 7-9 (existe, macros razonables, cantidad razonable)
// - Entrenamiento: 10-14 (volumen semanal, campos completos, equipamiento,
//   lesiones, duración de sesión)
// - Suplementos: 15-17 (dentro de lista permitida, dosis seguras, evidencia)
// - Coherencia: 18-20 (días/comidas, legal / referencia ACSM)

import type { ClientProfile, GeneratedPlan, ProcessedContext } from './types';
import { buscarIngrediente } from './ingredientsDb';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type Severidad = 'critica' | 'alta' | 'media' | 'baja';

export interface Observacion {
  severidad: Severidad;
  check: string;
  descripcion: string;
  ubicacion: string;
  valorEncontrado: unknown;
  valorEsperado: unknown;
  sugerenciaCorreccion?: string;
}

export type ProofreaderStatus = 'aprobado' | 'aprobado_con_observaciones' | 'rechazado';

export interface ProofreaderReport {
  planId: string;
  status: ProofreaderStatus;
  checksEjecutados: number;
  checksFallidos: number;
  observaciones: Observacion[];
  resumenParaTrainer: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function dentroTolerancia(actual: number, esperado: number, pctTolerancia: number): boolean {
  if (esperado === 0) return actual === 0;
  return Math.abs((actual - esperado) / esperado) * 100 <= pctTolerancia;
}

function sum<T>(items: T[], selector: (t: T) => number): number {
  return items.reduce((acc, it) => acc + selector(it), 0);
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // quitar tildes
}

// ─── MAPEOS DE CONTRAINDICACIONES ─────────────────────────────────────────────

// Mapeo de lesiones → ejercicios contraindicados (keyword-based, pragmático)
const CONTRAINDICACIONES: Array<{
  lesion: RegExp;
  ejercicios: RegExp;
  severidadActual: Severidad;
  severidadPasada: Severidad;
  zona: string;
}> = [
  {
    lesion: /lumbar|espalda baja|hernia discal|disco|ciatica|ciática|l[1-5]/i,
    ejercicios: /peso muerto convencional|buenos dias|buenos d[ií]as|sentadilla con barra.*espalda|hip thrust pesado|good morning|remo.*inclinado/i,
    severidadActual: 'critica',
    severidadPasada: 'alta',
    zona: 'zona lumbar',
  },
  {
    lesion: /rodilla|menisco|ligamento cruzado|lca|ligament|rotul/i,
    ejercicios: /sentadilla profunda|full squat|patada|kickback.*pierna|step.*altura|salto pliom/i,
    severidadActual: 'critica',
    severidadPasada: 'alta',
    zona: 'rodilla',
  },
  {
    lesion: /hombro|manguito|rotador|supraespinoso|tendinitis.*hombro/i,
    ejercicios: /press militar detr[áa]s.*cuello|jal[óo]n.*cuello|press franc[eé]s|press tras nuca|vuelo lateral.*pesado/i,
    severidadActual: 'critica',
    severidadPasada: 'alta',
    zona: 'hombro',
  },
  {
    lesion: /codo|epicondilitis|tenista|golfista/i,
    ejercicios: /curl.*barra recta pesado|press franc[eé]s pesado|extensi[óo]n.*tr[íi]ceps.*barra/i,
    severidadActual: 'alta',
    severidadPasada: 'media',
    zona: 'codo',
  },
  {
    lesion: /mu[ñn]eca|carpo|carpal/i,
    ejercicios: /fondos.*paralelas|flexion.*barra|handstand/i,
    severidadActual: 'alta',
    severidadPasada: 'media',
    zona: 'muñeca',
  },
];

// Heurística: qué equipamiento requiere el nombre del ejercicio
function detectarEquipamientoRequerido(nombreEj: string): string[] {
  const reqs: string[] = [];
  const n = normalizar(nombreEj);

  if (/\bbarra\b|olimpic|barbell|press de banca(?! con mancuernas)/.test(n)) reqs.push('barra');
  if (/mancuerna|dumbbell|db\b/.test(n)) reqs.push('mancuernas');
  if (/polea|cable\b/.test(n)) reqs.push('poleas');
  if (/maquina|m[áa]quina|smith|leg press|prensa de piernas|hack squat/.test(n)) reqs.push('maquinas');
  if (/kettlebell|pesa rusa/.test(n)) reqs.push('kettlebell');
  if (/banda|elastic/.test(n)) reqs.push('bandas');
  if (/trx|suspensi[óo]n/.test(n)) reqs.push('trx');
  if (/jaula|rack|power rack|squat rack/.test(n)) reqs.push('rack');
  if (/dominada|pull.?up|chin.?up/.test(n)) reqs.push('barra_dominadas');
  if (/paralelas|dip(?:s)?\b|fondos en paralelas/.test(n)) reqs.push('paralelas');

  return reqs;
}

// Normaliza items del array `equipamientoDisponible` del cliente a las categorías internas
function normalizarEquipamientoDisponible(items: string[]): Set<string> {
  const s = new Set<string>();
  for (const item of items) {
    const n = normalizar(item);
    if (/\bgym\b|gimnasio/.test(n)) {
      // gym completo: todo disponible
      ['barra','mancuernas','poleas','maquinas','kettlebell','bandas','rack','barra_dominadas','paralelas'].forEach((e) => s.add(e));
    }
    if (/barra(?!.*dominadas)/.test(n)) s.add('barra');
    if (/mancuerna|dumbbell/.test(n)) s.add('mancuernas');
    if (/polea|cable/.test(n)) s.add('poleas');
    if (/maquina|m[áa]quina/.test(n)) s.add('maquinas');
    if (/kettlebell|pesa rusa/.test(n)) s.add('kettlebell');
    if (/banda|elastic/.test(n)) s.add('bandas');
    if (/trx|suspensi[óo]n/.test(n)) s.add('trx');
    if (/rack|jaula/.test(n)) s.add('rack');
    if (/dominada|pull.?up/.test(n)) s.add('barra_dominadas');
    if (/paralela|dip/.test(n)) s.add('paralelas');
    // peso corporal → se asume siempre disponible
    if (/peso corporal|bodyweight|calistenia/.test(n)) { /* nada extra */ }
  }
  return s;
}

// ─── CHECKS MATEMÁTICOS (1-6) ────────────────────────────────────────────────

// Check 1: kcal declaradas de cada ingrediente coinciden con sus macros (±3%)
function check1_kcalIngrediente(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];
  plan.planNutricional.ejemploDiaTipo.forEach((comida, ci) => {
    comida.ingredientes.forEach((ing, ii) => {
      const calc = ing.proteinaG * 4 + ing.carbosG * 4 + ing.grasaG * 9;
      if (!dentroTolerancia(ing.kcal, calc, 3)) {
        obs.push({
          severidad: 'alta',
          check: 'check_1_kcal_ingrediente',
          descripcion: `Kcal del ingrediente "${ing.nombre}" (${comida.comida}) no coinciden con sus macros`,
          ubicacion: `planNutricional.ejemploDiaTipo[${ci}].ingredientes[${ii}].kcal`,
          valorEncontrado: ing.kcal,
          valorEsperado: Math.round(calc),
          sugerenciaCorreccion: `Corregir kcal a ${Math.round(calc)} (P:${ing.proteinaG}×4 + C:${ing.carbosG}×4 + G:${ing.grasaG}×9)`,
        });
      }
    });
  });
  return obs;
}

// Check 2: suma de macros de ingredientes == totales de la comida (±5%)
function check2_sumaMacrosPorComida(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];
  plan.planNutricional.ejemploDiaTipo.forEach((comida, ci) => {
    const sumP = sum(comida.ingredientes, (i) => i.proteinaG);
    const sumC = sum(comida.ingredientes, (i) => i.carbosG);
    const sumG = sum(comida.ingredientes, (i) => i.grasaG);
    const sumK = sum(comida.ingredientes, (i) => i.kcal);

    const checks: Array<[string, number, number]> = [
      ['proteinaG', sumP, comida.totalesComida.proteinaG],
      ['carbosG', sumC, comida.totalesComida.carbosG],
      ['grasaG', sumG, comida.totalesComida.grasaG],
      ['kcal', sumK, comida.totalesComida.kcal],
    ];

    for (const [campo, calculado, declarado] of checks) {
      if (!dentroTolerancia(declarado, calculado, 5)) {
        obs.push({
          severidad: 'alta',
          check: 'check_2_suma_macros_comida',
          descripcion: `Total de ${campo} de la comida "${comida.comida}" no coincide con la suma de sus ingredientes`,
          ubicacion: `planNutricional.ejemploDiaTipo[${ci}].totalesComida.${campo}`,
          valorEncontrado: declarado,
          valorEsperado: Math.round(calculado * 10) / 10,
        });
      }
    }
  });
  return obs;
}

// Check 3: suma de totales de comidas == totales del día (±5%)
function check3_sumaTotalesDia(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];
  const comidas = plan.planNutricional.ejemploDiaTipo;

  const totalProt = sum(comidas, (c) => c.totalesComida.proteinaG);
  const totalCarb = sum(comidas, (c) => c.totalesComida.carbosG);
  const totalGras = sum(comidas, (c) => c.totalesComida.grasaG);
  const totalKcal = sum(comidas, (c) => c.totalesComida.kcal);

  const re = plan.resumenEjecutivo;

  const checks: Array<[string, number, number]> = [
    ['proteinaG', totalProt, re.macros.proteinaG],
    ['carbosG', totalCarb, re.macros.carbosG],
    ['grasaG', totalGras, re.macros.grasaG],
    ['kcal', totalKcal, re.caloriesDiarias],
  ];

  for (const [campo, calculado, declarado] of checks) {
    if (!dentroTolerancia(declarado, calculado, 5)) {
      obs.push({
        severidad: 'alta',
        check: 'check_3_suma_totales_dia',
        descripcion: `${campo} del día declarado en resumenEjecutivo no coincide con la suma de las comidas`,
        ubicacion: campo === 'kcal' ? 'resumenEjecutivo.caloriesDiarias' : `resumenEjecutivo.macros.${campo}`,
        valorEncontrado: declarado,
        valorEsperado: Math.round(calculado),
        sugerenciaCorreccion: `Ajustar día tipo o resumen ejecutivo para que coincidan`,
      });
    }
  }
  return obs;
}

// Check 4: proteína diaria dentro de pesoKg * [1.6, 2.4]
function check4_rangoProteina(plan: GeneratedPlan, perfil: ClientProfile): Observacion[] {
  const prot = plan.resumenEjecutivo.macros.proteinaG;
  const min = perfil.pesoKg * 1.6;
  const max = perfil.pesoKg * 2.4;

  if (prot < min || prot > max) {
    return [{
      severidad: prot < min ? 'critica' : 'alta',
      check: 'check_4_rango_proteina',
      descripcion: `Proteína diaria fuera del rango recomendado (${perfil.pesoKg}kg × [1.6, 2.4] g/kg)`,
      ubicacion: 'resumenEjecutivo.macros.proteinaG',
      valorEncontrado: prot,
      valorEsperado: `${Math.round(min)}–${Math.round(max)}g`,
      sugerenciaCorreccion: `Ajustar a ${Math.round((min + max) / 2)}g para un valor óptimo`,
    }];
  }
  return [];
}

// Check 5: grasa diaria dentro de pesoKg * [0.4, 1.5] — fisiológico 0.6 como mínimo recomendado
function check5_rangoGrasa(plan: GeneratedPlan, perfil: ClientProfile): Observacion[] {
  const grasa = plan.resumenEjecutivo.macros.grasaG;
  const minCritico = perfil.pesoKg * 0.4; // mínimo absoluto
  const minRecomendado = perfil.pesoKg * 0.6;
  const max = perfil.pesoKg * 1.5;

  if (grasa < minCritico) {
    return [{
      severidad: 'critica',
      check: 'check_5_rango_grasa',
      descripcion: `Grasa diaria por debajo del mínimo absoluto (${perfil.pesoKg}kg × 0.4 g/kg)`,
      ubicacion: 'resumenEjecutivo.macros.grasaG',
      valorEncontrado: grasa,
      valorEsperado: `≥ ${Math.round(minCritico)}g`,
      sugerenciaCorreccion: `Subir a ${Math.round(minRecomendado)}g mínimo`,
    }];
  }
  if (grasa < minRecomendado) {
    return [{
      severidad: 'media',
      check: 'check_5_rango_grasa',
      descripcion: `Grasa diaria por debajo del mínimo fisiológico recomendado (${perfil.pesoKg}kg × 0.6 g/kg)`,
      ubicacion: 'resumenEjecutivo.macros.grasaG',
      valorEncontrado: grasa,
      valorEsperado: `≥ ${Math.round(minRecomendado)}g`,
    }];
  }
  if (grasa > max) {
    return [{
      severidad: 'alta',
      check: 'check_5_rango_grasa',
      descripcion: `Grasa diaria por encima del rango recomendado (${perfil.pesoKg}kg × 1.5 g/kg)`,
      ubicacion: 'resumenEjecutivo.macros.grasaG',
      valorEncontrado: grasa,
      valorEsperado: `≤ ${Math.round(max)}g`,
    }];
  }
  return [];
}

// Check 6: kcal diarias dentro de ±2% del caloriasObjetivo calculado en processing
function check6_caloriasVsObjetivo(plan: GeneratedPlan, ctx: ProcessedContext): Observacion[] {
  const kcalDiaria = plan.resumenEjecutivo.caloriesDiarias;
  if (!dentroTolerancia(kcalDiaria, ctx.caloriasObjetivo, 2)) {
    return [{
      severidad: Math.abs(kcalDiaria - ctx.caloriasObjetivo) / ctx.caloriasObjetivo > 0.05 ? 'alta' : 'media',
      check: 'check_6_calorias_vs_objetivo',
      descripcion: `Calorías del plan difieren del objetivo calculado en processing (±2%)`,
      ubicacion: 'resumenEjecutivo.caloriesDiarias',
      valorEncontrado: kcalDiaria,
      valorEsperado: ctx.caloriasObjetivo,
      sugerenciaCorreccion: `Ajustar a ${ctx.caloriasObjetivo} kcal (${ctx.ajusteCaloricoDesc})`,
    }];
  }
  return [];
}

// ─── CHECKS DE ENTRENAMIENTO (10-13) ─────────────────────────────────────────

// Check 10: volumen semanal por grupo muscular dentro del rango por nivel
function check10_volumenSemanal(plan: GeneratedPlan, ctx: ProcessedContext): Observacion[] {
  const obs: Observacion[] = [];
  const { seriesMin, seriesMax } = ctx.volumenSemanal;

  // Sumar series por grupo muscular en todos los días
  const acumulado: Record<string, number> = {};
  for (const dia of plan.planEntrenamiento.distribucionSemanal) {
    for (const ej of dia.ejercicios) {
      const grupo = normalizar(ej.grupoMuscular);
      acumulado[grupo] = (acumulado[grupo] ?? 0) + ej.series;
    }
  }

  for (const [grupo, series] of Object.entries(acumulado)) {
    if (series < seriesMin) {
      obs.push({
        severidad: 'media',
        check: 'check_10_volumen_semanal',
        descripcion: `Grupo "${grupo}" tiene volumen semanal por debajo del rango recomendado`,
        ubicacion: `planEntrenamiento.distribucionSemanal[*].ejercicios[grupoMuscular="${grupo}"]`,
        valorEncontrado: `${series} series/semana`,
        valorEsperado: `${seriesMin}–${seriesMax} series/semana`,
      });
    } else if (series > seriesMax * 1.25) {
      obs.push({
        severidad: 'alta',
        check: 'check_10_volumen_semanal',
        descripcion: `Grupo "${grupo}" tiene volumen semanal excesivo (>125% del rango superior)`,
        ubicacion: `planEntrenamiento.distribucionSemanal[*].ejercicios[grupoMuscular="${grupo}"]`,
        valorEncontrado: `${series} series/semana`,
        valorEsperado: `${seriesMin}–${seriesMax} series/semana`,
      });
    }
  }
  return obs;
}

// Check 11: cada ejercicio tiene series, repeticiones, RIR, descanso
function check11_camposEjercicio(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];
  plan.planEntrenamiento.distribucionSemanal.forEach((dia, di) => {
    dia.ejercicios.forEach((ej, ei) => {
      const faltantes: string[] = [];
      if (!ej.nombre || ej.nombre.trim() === '') faltantes.push('nombre');
      if (!ej.series || ej.series <= 0) faltantes.push('series');
      if (!ej.repeticiones || ej.repeticiones.trim() === '') faltantes.push('repeticiones');
      if (ej.rir === undefined || ej.rir === null) faltantes.push('rir');
      if (!ej.descansoSeg || ej.descansoSeg <= 0) faltantes.push('descansoSeg');

      if (faltantes.length > 0) {
        obs.push({
          severidad: 'critica',
          check: 'check_11_campos_ejercicio',
          descripcion: `Ejercicio "${ej.nombre || '(sin nombre)'}" en ${dia.nombre} tiene campos incompletos`,
          ubicacion: `planEntrenamiento.distribucionSemanal[${di}].ejercicios[${ei}]`,
          valorEncontrado: faltantes.join(', '),
          valorEsperado: 'todos los campos completos',
        });
      }
    });
  });
  return obs;
}

// Check 12: si lugarEntrenamiento=casa, no requerir equipo no declarado
function check12_equipamientoCasa(plan: GeneratedPlan, perfil: ClientProfile): Observacion[] {
  if (perfil.lugarEntrenamiento !== 'casa') return [];

  const obs: Observacion[] = [];
  const disponible = normalizarEquipamientoDisponible(perfil.equipamientoDisponible);

  plan.planEntrenamiento.distribucionSemanal.forEach((dia, di) => {
    dia.ejercicios.forEach((ej, ei) => {
      const requiere = detectarEquipamientoRequerido(ej.nombre);
      const faltante = requiere.filter((r) => !disponible.has(r));

      if (faltante.length > 0 && !ej.sustitutoEnCasa) {
        obs.push({
          severidad: 'alta',
          check: 'check_12_equipamiento_casa',
          descripcion: `Ejercicio "${ej.nombre}" requiere equipo no declarado y no tiene sustituto en casa`,
          ubicacion: `planEntrenamiento.distribucionSemanal[${di}].ejercicios[${ei}]`,
          valorEncontrado: `requiere: ${faltante.join(', ')} | disponible: ${[...disponible].join(', ') || 'nada'}`,
          valorEsperado: 'sustituto en casa o ejercicio con equipo disponible',
          sugerenciaCorreccion: `Agregar "sustitutoEnCasa" con un ejercicio que use solo peso corporal o el equipo declarado`,
        });
      }
    });
  });
  return obs;
}

// Check 13: ejercicios no contradicen lesiones declaradas
function check13_lesiones(plan: GeneratedPlan, perfil: ClientProfile): Observacion[] {
  const obs: Observacion[] = [];
  const lesionesActivas = perfil.lesionesActuales.map((l) => l.trim()).filter(Boolean);
  const lesionesPasadas = perfil.lesionesPasadas.map((l) => l.trim()).filter(Boolean);

  for (const { lesion, ejercicios, severidadActual, severidadPasada, zona } of CONTRAINDICACIONES) {
    const esActiva = lesionesActivas.some((l) => lesion.test(l));
    const esPasada = lesionesPasadas.some((l) => lesion.test(l));
    if (!esActiva && !esPasada) continue;

    const severidad = esActiva ? severidadActual : severidadPasada;

    plan.planEntrenamiento.distribucionSemanal.forEach((dia, di) => {
      dia.ejercicios.forEach((ej, ei) => {
        if (ejercicios.test(ej.nombre)) {
          obs.push({
            severidad,
            check: 'check_13_lesiones',
            descripcion: `Ejercicio "${ej.nombre}" potencialmente contraindicado para ${zona} (lesión ${esActiva ? 'activa' : 'pasada'} declarada)`,
            ubicacion: `planEntrenamiento.distribucionSemanal[${di}].ejercicios[${ei}].nombre`,
            valorEncontrado: ej.nombre,
            valorEsperado: `ejercicio seguro para ${zona}`,
            sugerenciaCorreccion: `Reemplazar por variante más segura (hinge con mancuernas, prensa con rango parcial, press con mancuernas en plano neutro, etc.)`,
          });
        }
      });
    });
  }

  return obs;
}

// ─── CHECKS DE INGREDIENTES VS DB (7-9) ──────────────────────────────────────

// Check 7: cada ingrediente se puede matchear contra la DB interna
function check7_ingredienteExiste(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];
  plan.planNutricional.ejemploDiaTipo.forEach((comida, ci) => {
    comida.ingredientes.forEach((ing, ii) => {
      const ref = buscarIngrediente(ing.nombre);
      if (!ref) {
        obs.push({
          severidad: 'media',
          check: 'check_7_ingrediente_existe',
          descripcion: `Ingrediente "${ing.nombre}" no se pudo identificar en la base de datos interna`,
          ubicacion: `planNutricional.ejemploDiaTipo[${ci}].ingredientes[${ii}].nombre`,
          valorEncontrado: ing.nombre,
          valorEsperado: 'un nombre reconocible (ej: "pollo pechuga", "arroz integral cocido")',
          sugerenciaCorreccion: 'Reescribir con nomenclatura canónica o revisar manualmente',
        });
      }
    });
  });
  return obs;
}

// Check 8: macros declarados coinciden con DB (±25%, por variaciones y cortes)
function check8_macrosVsDb(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];
  plan.planNutricional.ejemploDiaTipo.forEach((comida, ci) => {
    comida.ingredientes.forEach((ing, ii) => {
      const ref = buscarIngrediente(ing.nombre);
      if (!ref) return; // ya lo reporta check 7

      // Calcular macros esperados para la cantidad declarada
      const factor = ing.cantidadG / 100;
      const expProt = ref.proteinaG * factor;
      const expCarb = ref.carbosG * factor;
      const expGras = ref.grasaG * factor;

      const checks: Array<[string, number, number, number]> = [
        // umbral mínimo absoluto para evitar falsos positivos en trazas
        ['proteinaG', ing.proteinaG, expProt, 2],
        ['carbosG', ing.carbosG, expCarb, 3],
        ['grasaG', ing.grasaG, expGras, 1.5],
      ];

      for (const [campo, declarado, esperado, umbralAbs] of checks) {
        if (Math.max(declarado, esperado) < umbralAbs) continue; // valores muy bajos: skip
        if (!dentroTolerancia(declarado, esperado, 25)) {
          obs.push({
            severidad: 'media',
            check: 'check_8_macros_vs_db',
            descripcion: `${campo} declarado de "${ing.nombre}" (${ing.cantidadG}g) difiere >25% del valor de referencia`,
            ubicacion: `planNutricional.ejemploDiaTipo[${ci}].ingredientes[${ii}].${campo}`,
            valorEncontrado: Math.round(declarado * 10) / 10,
            valorEsperado: `~${Math.round(esperado * 10) / 10} (ref ${ref.nombre})`,
          });
        }
      }
    });
  });
  return obs;
}

// Check 9: la cantidad del ingrediente es razonable (no 500g de aceite)
function check9_cantidadRazonable(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];
  plan.planNutricional.ejemploDiaTipo.forEach((comida, ci) => {
    comida.ingredientes.forEach((ing, ii) => {
      const ref = buscarIngrediente(ing.nombre);
      if (!ref || !ref.cantidadRazonableMaxG) return;

      if (ing.cantidadG > ref.cantidadRazonableMaxG) {
        obs.push({
          severidad: ing.cantidadG > ref.cantidadRazonableMaxG * 2 ? 'alta' : 'media',
          check: 'check_9_cantidad_razonable',
          descripcion: `Cantidad de "${ing.nombre}" es inusualmente alta para una comida`,
          ubicacion: `planNutricional.ejemploDiaTipo[${ci}].ingredientes[${ii}].cantidadG`,
          valorEncontrado: `${ing.cantidadG}g`,
          valorEsperado: `≤ ${ref.cantidadRazonableMaxG}g por porción`,
        });
      }
    });
  });
  return obs;
}

// ─── CHECK DE DURACIÓN DE SESIÓN (14) ────────────────────────────────────────

// Check 14: duración declarada de cada día coincide con perfil.minutosPorSesion (±20%)
function check14_duracionSesion(plan: GeneratedPlan, perfil: ClientProfile): Observacion[] {
  const obs: Observacion[] = [];
  plan.planEntrenamiento.distribucionSemanal.forEach((dia, di) => {
    const declarada = dia.duracionEstimadaMin;
    if (!declarada || declarada <= 0) {
      obs.push({
        severidad: 'media',
        check: 'check_14_duracion_sesion',
        descripcion: `${dia.nombre} no declara duracionEstimadaMin`,
        ubicacion: `planEntrenamiento.distribucionSemanal[${di}].duracionEstimadaMin`,
        valorEncontrado: declarada,
        valorEsperado: `${perfil.minutosPorSesion} min (±20%)`,
      });
      return;
    }

    if (!dentroTolerancia(declarada, perfil.minutosPorSesion, 20)) {
      const diff = declarada - perfil.minutosPorSesion;
      obs.push({
        severidad: Math.abs(diff) > perfil.minutosPorSesion * 0.4 ? 'alta' : 'media',
        check: 'check_14_duracion_sesion',
        descripcion: `${dia.nombre} tiene duración ${diff > 0 ? 'superior' : 'inferior'} a la declarada por el cliente`,
        ubicacion: `planEntrenamiento.distribucionSemanal[${di}].duracionEstimadaMin`,
        valorEncontrado: `${declarada} min`,
        valorEsperado: `~${perfil.minutosPorSesion} min (±20%)`,
        sugerenciaCorreccion: diff > 0
          ? 'Reducir volumen de ejercicios o acortar descansos'
          : 'Agregar ejercicios accesorios o aumentar descansos',
      });
    }
  });
  return obs;
}

// ─── CHECKS DE SUPLEMENTOS (15-17) ───────────────────────────────────────────

// Lista permitida según CLAUDE.md / SYSTEM_PROMPT
const SUPLEMENTOS_PERMITIDOS: Array<{
  nombre: string;
  patron: RegExp;
  dosisMinG?: number;
  dosisMaxG?: number;
  unidadEsperada: RegExp;
}> = [
  {
    nombre: 'proteína en polvo (whey/caseína/vegetal)',
    patron: /whey|casein|caseina|prote[ií]na en polvo|prote[ií]na.*(suero|vegetal|aislad|concentr)/i,
    dosisMinG: 20, dosisMaxG: 50,
    unidadEsperada: /\bg\b|gramos?|scoop|medida/i,
  },
  {
    nombre: 'creatina monohidratada',
    patron: /creatina/i,
    dosisMinG: 3, dosisMaxG: 10,
    unidadEsperada: /\bg\b|gramos?/i,
  },
  {
    nombre: 'cafeína',
    patron: /cafe[ií]na|caffeine/i,
    dosisMinG: 0.05, dosisMaxG: 0.4, // 50-400mg
    unidadEsperada: /mg|miligramos?/i,
  },
  {
    nombre: 'omega-3 (EPA/DHA)',
    patron: /omega.?3|epa|dha|aceite.*pescado/i,
    dosisMinG: 1, dosisMaxG: 4,
    unidadEsperada: /\bg\b|gramos?|mg|miligramos?/i,
  },
  {
    nombre: 'vitamina D',
    patron: /vitamina d(?!$|[aeioulmn])|\bvit.*d3?\b|colecalcif/i,
    unidadEsperada: /ui|iu|mcg|microgramos?|\u00b5g/i,
  },
  {
    nombre: 'colágeno hidrolizado + vitamina C',
    patron: /col[áa]geno|collagen/i,
    dosisMinG: 10, dosisMaxG: 20,
    unidadEsperada: /\bg\b|gramos?/i,
  },
];

// Check 15: todo suplemento listado está en la lista permitida
function check15_suplementosPermitidos(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];
  (plan.planNutricional.suplementacion ?? []).forEach((s, si) => {
    const match = SUPLEMENTOS_PERMITIDOS.find((p) => p.patron.test(s.nombre));
    if (!match) {
      obs.push({
        severidad: 'critica',
        check: 'check_15_suplementos_permitidos',
        descripcion: `Suplemento "${s.nombre}" no está en la lista permitida de Re-Viva`,
        ubicacion: `planNutricional.suplementacion[${si}].nombre`,
        valorEncontrado: s.nombre,
        valorEsperado: 'uno de: proteína en polvo, creatina, cafeína, omega-3, vitamina D, colágeno+vit C',
        sugerenciaCorreccion: 'Eliminar o sustituir por un suplemento permitido con evidencia sólida',
      });
    }
  });
  return obs;
}

// Check 16: dosis dentro de rangos seguros/efectivos
function check16_dosisSuplementos(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];

  const parsearCantidad = (dosis: string): { valor: number; esMg: boolean; esUI: boolean } | null => {
    // ej: "5g", "200mg", "2000 UI", "25 gramos"
    const m = dosis.match(/(\d+(?:[.,]\d+)?)\s*(g|gramos?|mg|miligramos?|mcg|\u00b5g|microgramos?|ui|iu)/i);
    if (!m) return null;
    const n = parseFloat(m[1].replace(',', '.'));
    const u = m[2].toLowerCase();
    const esMg = /^mg|mili/.test(u);
    const esMcg = /^mcg|\u00b5g|micro/.test(u);
    const esUI = /^(ui|iu)$/.test(u);
    if (esMg) return { valor: n / 1000, esMg: true, esUI: false };
    if (esMcg) return { valor: n / 1_000_000, esMg: false, esUI: false };
    if (esUI) return { valor: n, esMg: false, esUI: true };
    return { valor: n, esMg: false, esUI: false };
  };

  (plan.planNutricional.suplementacion ?? []).forEach((s, si) => {
    const match = SUPLEMENTOS_PERMITIDOS.find((p) => p.patron.test(s.nombre));
    if (!match || (!match.dosisMinG && !match.dosisMaxG)) return;

    const parsed = parsearCantidad(s.dosis);
    if (!parsed) {
      obs.push({
        severidad: 'media',
        check: 'check_16_dosis_suplementos',
        descripcion: `No se pudo parsear la dosis del suplemento "${s.nombre}"`,
        ubicacion: `planNutricional.suplementacion[${si}].dosis`,
        valorEncontrado: s.dosis,
        valorEsperado: 'formato explícito con unidad (ej: "5g", "200mg")',
      });
      return;
    }

    // Vitamina D: se mide en UI o mcg, no en gramos — no validamos dosis aquí
    if (parsed.esUI || match.nombre.includes('vitamina D')) return;

    const { valor } = parsed;
    if (match.dosisMinG !== undefined && valor < match.dosisMinG) {
      obs.push({
        severidad: 'media',
        check: 'check_16_dosis_suplementos',
        descripcion: `Dosis de "${s.nombre}" por debajo del rango efectivo`,
        ubicacion: `planNutricional.suplementacion[${si}].dosis`,
        valorEncontrado: s.dosis,
        valorEsperado: `${match.dosisMinG}–${match.dosisMaxG ?? '?'}g`,
      });
    } else if (match.dosisMaxG !== undefined && valor > match.dosisMaxG) {
      obs.push({
        severidad: 'alta',
        check: 'check_16_dosis_suplementos',
        descripcion: `Dosis de "${s.nombre}" por encima del rango seguro`,
        ubicacion: `planNutricional.suplementacion[${si}].dosis`,
        valorEncontrado: s.dosis,
        valorEsperado: `≤ ${match.dosisMaxG}g`,
      });
    }
  });
  return obs;
}

// Check 17: cada suplemento tiene referencia de evidencia
function check17_evidenciaSuplementos(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];
  (plan.planNutricional.suplementacion ?? []).forEach((s, si) => {
    if (!s.evidencia || s.evidencia.trim().length < 15) {
      obs.push({
        severidad: 'media',
        check: 'check_17_evidencia_suplementos',
        descripcion: `Suplemento "${s.nombre}" no tiene una referencia de evidencia adecuada`,
        ubicacion: `planNutricional.suplementacion[${si}].evidencia`,
        valorEncontrado: s.evidencia || '(vacío)',
        valorEsperado: 'referencia mínima con autor/año o mecanismo',
      });
    }
  });
  return obs;
}

// ─── CHECKS DE COHERENCIA Y LEGAL (18-20) ────────────────────────────────────

// Check 18: cantidad de días de entrenamiento == perfil.diasPorSemana
function check18_coherenciaDias(plan: GeneratedPlan, perfil: ClientProfile): Observacion[] {
  const declarados = plan.planEntrenamiento.distribucionSemanal.length;
  if (declarados !== perfil.diasPorSemana) {
    return [{
      severidad: declarados < perfil.diasPorSemana ? 'critica' : 'alta',
      check: 'check_18_coherencia_dias',
      descripcion: `Cantidad de días de entrenamiento no coincide con lo declarado por el cliente`,
      ubicacion: 'planEntrenamiento.distribucionSemanal',
      valorEncontrado: `${declarados} días`,
      valorEsperado: `${perfil.diasPorSemana} días`,
    }];
  }
  return [];
}

// Check 19: cantidad de comidas del día tipo >= perfil.comidasPorDia
function check19_coherenciaComidas(plan: GeneratedPlan, perfil: ClientProfile): Observacion[] {
  const declaradas = plan.planNutricional.ejemploDiaTipo.length;
  if (declaradas < perfil.comidasPorDia) {
    return [{
      severidad: 'alta',
      check: 'check_19_coherencia_comidas',
      descripcion: `El día tipo tiene menos comidas que las declaradas por el cliente`,
      ubicacion: 'planNutricional.ejemploDiaTipo',
      valorEncontrado: `${declaradas} comidas`,
      valorEsperado: `al menos ${perfil.comidasPorDia} comidas`,
    }];
  }
  return [];
}

// Check 20: legal — referencia ACSM presente + sin claims médicas prohibidas
function check20_coherenciaLegal(plan: GeneratedPlan): Observacion[] {
  const obs: Observacion[] = [];

  // 20.a — Referencia ACSM en parametrosGlobales
  const ref = plan.planEntrenamiento.parametrosGlobales.referenciaCientifica ?? '';
  if (!/acsm|position stand/i.test(ref) || !/202[45]/.test(ref)) {
    obs.push({
      severidad: 'alta',
      check: 'check_20_coherencia_legal',
      descripcion: 'Referencia científica del plan de entrenamiento no cita ACSM Position Stand 2025',
      ubicacion: 'planEntrenamiento.parametrosGlobales.referenciaCientifica',
      valorEncontrado: ref || '(vacío)',
      valorEsperado: 'ACSM Position Stand 2025 (PMC12965823)',
    });
  }

  // 20.b — Claims médicas / terapéuticas prohibidas en textos del plan
  const CLAIMS_PROHIBIDAS = [
    { patron: /\bcura\b|curar[áa]|cura\s/i, desc: 'claim de cura médica' },
    { patron: /garantiz(o|a|amos|ado)\s+(resultado|perdid|cambio)/i, desc: 'garantía de resultado' },
    { patron: /reemplaza(r|s|mos)?\s+(la|el)?\s*(medic|consult|tratamient)/i, desc: 'reemplaza consulta/medicación' },
    { patron: /trata(r|miento)\s+(diabet|depresion|hipertens|cancer)/i, desc: 'tratamiento de patología' },
  ];

  const textosPlanos: Array<{ texto: string; ubicacion: string }> = [
    { texto: plan.resumenEjecutivo.objetivo ?? '', ubicacion: 'resumenEjecutivo.objetivo' },
    { texto: plan.planNutricional.estrategiaCalorica ?? '', ubicacion: 'planNutricional.estrategiaCalorica' },
    { texto: plan.planNutricional.timingPeriEntrenamiento ?? '', ubicacion: 'planNutricional.timingPeriEntrenamiento' },
    { texto: plan.planNutricional.hidratacion ?? '', ubicacion: 'planNutricional.hidratacion' },
  ];
  for (const dia of plan.planEntrenamiento.distribucionSemanal) {
    textosPlanos.push({ texto: dia.notasInstructor ?? '', ubicacion: `planEntrenamiento…${dia.nombre}.notasInstructor` });
  }

  for (const { texto, ubicacion } of textosPlanos) {
    if (!texto) continue;
    for (const c of CLAIMS_PROHIBIDAS) {
      if (c.patron.test(texto)) {
        obs.push({
          severidad: 'critica',
          check: 'check_20_coherencia_legal',
          descripcion: `Texto contiene ${c.desc} — prohibido legalmente en el marco Re-Viva`,
          ubicacion,
          valorEncontrado: texto.slice(0, 120) + (texto.length > 120 ? '…' : ''),
          valorEsperado: 'texto sin claims médicas ni garantías de resultado',
          sugerenciaCorreccion: 'Reformular con lenguaje educativo y sin promesas',
        });
      }
    }
  }

  return obs;
}

// ─── ORQUESTACIÓN ─────────────────────────────────────────────────────────────

function generarResumen(observaciones: Observacion[], status: ProofreaderStatus): string {
  const criticas = observaciones.filter((o) => o.severidad === 'critica');
  const altas = observaciones.filter((o) => o.severidad === 'alta');
  const medias = observaciones.filter((o) => o.severidad === 'media');
  const bajas = observaciones.filter((o) => o.severidad === 'baja');

  if (status === 'aprobado' && observaciones.length === 0) {
    return 'Plan validado sin observaciones. Listo para aprobación rápida del trainer.';
  }

  const partes: string[] = [];

  if (criticas.length > 0) {
    partes.push(
      `Plan rechazado por ${criticas.length} error${criticas.length > 1 ? 'es' : ''} crítico${criticas.length > 1 ? 's' : ''}: ${criticas.slice(0, 2).map((o) => o.descripcion).join('; ')}${criticas.length > 2 ? '...' : ''}.`
    );
  }

  if (altas.length > 0) {
    partes.push(
      `${altas.length} observación${altas.length > 1 ? 'es' : ''} de alta severidad${altas.length <= 2 ? ': ' + altas.map((o) => o.descripcion).join('; ') : ' que requieren revisión'}.`
    );
  }

  if (medias.length > 0) {
    partes.push(`${medias.length} observación${medias.length > 1 ? 'es' : ''} de severidad media.`);
  }

  if (bajas.length > 0) {
    partes.push(`${bajas.length} observación${bajas.length > 1 ? 'es' : ''} menor${bajas.length > 1 ? 'es' : ''}.`);
  }

  return partes.join(' ');
}

function clasificarStatus(observaciones: Observacion[]): ProofreaderStatus {
  const criticas = observaciones.filter((o) => o.severidad === 'critica').length;
  const altas = observaciones.filter((o) => o.severidad === 'alta').length;

  if (criticas > 0) return 'rechazado';
  if (altas > 0) return 'aprobado_con_observaciones';
  return 'aprobado';
}

// Lista de todos los checks que se ejecutan (para contabilidad)
const CHECKS_REGISTRADOS = [
  'check_1_kcal_ingrediente',
  'check_2_suma_macros_comida',
  'check_3_suma_totales_dia',
  'check_4_rango_proteina',
  'check_5_rango_grasa',
  'check_6_calorias_vs_objetivo',
  'check_7_ingrediente_existe',
  'check_8_macros_vs_db',
  'check_9_cantidad_razonable',
  'check_10_volumen_semanal',
  'check_11_campos_ejercicio',
  'check_12_equipamiento_casa',
  'check_13_lesiones',
  'check_14_duracion_sesion',
  'check_15_suplementos_permitidos',
  'check_16_dosis_suplementos',
  'check_17_evidencia_suplementos',
  'check_18_coherencia_dias',
  'check_19_coherencia_comidas',
  'check_20_coherencia_legal',
];

/**
 * Ejecuta el proofreader sobre un plan generado.
 * NO hace llamadas externas — todas las validaciones son deterministas.
 */
export function ejecutarProofreader(
  plan: GeneratedPlan,
  perfil: ClientProfile,
  ctx: ProcessedContext,
): ProofreaderReport {
  const observaciones: Observacion[] = [
    // Matemáticos (1-6)
    ...check1_kcalIngrediente(plan),
    ...check2_sumaMacrosPorComida(plan),
    ...check3_sumaTotalesDia(plan),
    ...check4_rangoProteina(plan, perfil),
    ...check5_rangoGrasa(plan, perfil),
    ...check6_caloriasVsObjetivo(plan, ctx),
    // Ingredientes vs DB (7-9)
    ...check7_ingredienteExiste(plan),
    ...check8_macrosVsDb(plan),
    ...check9_cantidadRazonable(plan),
    // Entrenamiento (10-14)
    ...check10_volumenSemanal(plan, ctx),
    ...check11_camposEjercicio(plan),
    ...check12_equipamientoCasa(plan, perfil),
    ...check13_lesiones(plan, perfil),
    ...check14_duracionSesion(plan, perfil),
    // Suplementos (15-17)
    ...check15_suplementosPermitidos(plan),
    ...check16_dosisSuplementos(plan),
    ...check17_evidenciaSuplementos(plan),
    // Coherencia y legal (18-20)
    ...check18_coherenciaDias(plan, perfil),
    ...check19_coherenciaComidas(plan, perfil),
    ...check20_coherenciaLegal(plan),
  ];

  const status = clasificarStatus(observaciones);
  const checksFallidos = new Set(observaciones.map((o) => o.check)).size;

  return {
    planId: plan.planId,
    status,
    checksEjecutados: CHECKS_REGISTRADOS.length,
    checksFallidos,
    observaciones,
    resumenParaTrainer: generarResumen(observaciones, status),
  };
}
