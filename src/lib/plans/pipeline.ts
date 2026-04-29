import crypto from 'crypto';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import {
  type ClientProfile,
  type FlagEspecial,
  type GeneratedPlan,
  type IntakeValidationResult,
  type PipelineResult,
  type ProcessedContext,
} from './types';
import { ejecutarProofreader, type ProofreaderReport } from './proofreader';

// ─── Modelos ──────────────────────────────────────────────────────────────────
const MODELS = {
  standard: 'claude-haiku-4-5-20251001',
  escalated: 'claude-sonnet-4-6',
} as const;

// Flags que obligan revisión manual sin pasar por proofreader
const FLAGS_ALTO_RIESGO: Array<{
  condicion: (p: ClientProfile) => boolean;
  descripcion: string;
}> = [
  {
    condicion: (p) => (p.flagsEspeciales ?? []).includes('embarazo'),
    descripcion: 'embarazo declarado',
  },
  {
    condicion: (p) =>
      (p.flagsEspeciales ?? []).includes('embarazo') &&
      p.objetivoPrincipal === 'perdida_grasa',
    descripcion: 'embarazo + objetivo pérdida de grasa',
  },
  {
    condicion: (p) =>
      p.condicionesMedicasDeclaradas.some((c) =>
        /card[íi]a[ck]|coraz[oó]n|infarto|arritmia/i.test(c),
      ) && p.diasPorSemana >= 5,
    descripcion: 'condición cardíaca declarada + alta frecuencia de entrenamiento',
  },
  {
    condicion: (p) => (p.flagsEspeciales ?? []).includes('adulto_mayor_65plus'),
    descripcion: 'adulto mayor de 65 años',
  },
];

// ─── ETAPA 1: INTAKE ──────────────────────────────────────────────────────────

export function validarIntake(perfil: ClientProfile): IntakeValidationResult {
  const errores: Array<{ campo: string; mensaje: string }> = [];

  const requeridos: Array<keyof ClientProfile> = [
    'id', 'nombre', 'email', 'fechaNacimiento', 'genero',
    'pesoKg', 'alturaCm', 'objetivoPrincipal',
    'diasPorSemana', 'minutosPorSesion', 'nivelExperiencia',
    'lugarEntrenamiento', 'equipamientoDisponible',
    'alergias', 'intolerancias', 'alimentosQueNoConsume', 'comidasPorDia',
    'condicionesMedicasDeclaradas', 'lesionesActuales', 'lesionesPasadas',
    'medicacionActual', 'nivelEstres', 'horasSuenoPromedio', 'consentimientos',
  ];

  for (const campo of requeridos) {
    const val = perfil[campo];
    if (val === undefined || val === null || val === '') {
      errores.push({ campo, mensaje: `Campo obligatorio faltante: ${campo}` });
    }
  }

  if (perfil.pesoKg !== undefined && (perfil.pesoKg < 30 || perfil.pesoKg > 300)) {
    errores.push({ campo: 'pesoKg', mensaje: 'Peso fuera de rango válido (30–300 kg)' });
  }
  if (perfil.alturaCm !== undefined && (perfil.alturaCm < 100 || perfil.alturaCm > 250)) {
    errores.push({ campo: 'alturaCm', mensaje: 'Altura fuera de rango válido (100–250 cm)' });
  }
  if (perfil.comidasPorDia !== undefined && (perfil.comidasPorDia < 2 || perfil.comidasPorDia > 8)) {
    errores.push({ campo: 'comidasPorDia', mensaje: 'Comidas por día debe estar entre 2 y 8' });
  }

  if (perfil.consentimientos) {
    const c = perfil.consentimientos;
    if (!c.aceptaTerminosYCondiciones)
      errores.push({ campo: 'consentimientos.aceptaTerminosYCondiciones', mensaje: 'Debe aceptar los términos y condiciones' });
    if (!c.aceptaPoliticaPrivacidad)
      errores.push({ campo: 'consentimientos.aceptaPoliticaPrivacidad', mensaje: 'Debe aceptar la política de privacidad' });
    if (!c.aceptaDescargoMedicoYResponsabilidad)
      errores.push({ campo: 'consentimientos.aceptaDescargoMedicoYResponsabilidad', mensaje: 'Debe aceptar el descargo médico' });
    if (!c.confirmaVeracidadDatos)
      errores.push({ campo: 'consentimientos.confirmaVeracidadDatos', mensaje: 'Debe confirmar la veracidad de los datos' });
  }

  return { valido: errores.length === 0, errores };
}

// ─── ETAPA 2: PROCESSING ─────────────────────────────────────────────────────

export function procesarPerfil(perfil: ClientProfile): ProcessedContext {
  // Edad
  const hoy = new Date();
  const nacimiento = new Date(perfil.fechaNacimiento);
  let edadAnios = hoy.getFullYear() - nacimiento.getFullYear();
  const cumpleEsteAnio = new Date(hoy.getFullYear(), nacimiento.getMonth(), nacimiento.getDate());
  if (hoy < cumpleEsteAnio) edadAnios--;

  // IMC
  const alturaMt = perfil.alturaCm / 100;
  const imc = perfil.pesoKg / (alturaMt * alturaMt);
  let imcCategoria = 'Normal';
  if (imc < 18.5) imcCategoria = 'Bajo peso';
  else if (imc < 25) imcCategoria = 'Normal';
  else if (imc < 30) imcCategoria = 'Sobrepeso';
  else imcCategoria = 'Obesidad';

  // BMR Mifflin-St Jeor
  const bmr =
    perfil.genero === 'masculino'
      ? 10 * perfil.pesoKg + 6.25 * perfil.alturaCm - 5 * edadAnios + 5
      : 10 * perfil.pesoKg + 6.25 * perfil.alturaCm - 5 * edadAnios - 161;

  // Factor de actividad
  let factorActividad: number;
  if (perfil.diasPorSemana <= 2) factorActividad = 1.375;
  else if (perfil.diasPorSemana <= 4) factorActividad = 1.55;
  else factorActividad = 1.725;

  const tdee = Math.round(bmr * factorActividad);

  // Calorías objetivo según meta
  let caloriasObjetivo: number;
  let ajusteCaloricoDesc: string;
  switch (perfil.objetivoPrincipal) {
    case 'perdida_grasa':
      caloriasObjetivo = Math.round(tdee * 0.82); // déficit ~18%
      ajusteCaloricoDesc = 'Déficit calórico del 18% sobre TDEE';
      break;
    case 'ganancia_muscular':
      caloriasObjetivo = Math.round(tdee * 1.10); // superávit 10%
      ajusteCaloricoDesc = 'Superávit calórico del 10% sobre TDEE';
      break;
    case 'recomposicion':
      caloriasObjetivo = tdee;
      ajusteCaloricoDesc = 'Mantenimiento calórico (recomposición)';
      break;
    default:
      caloriasObjetivo = tdee;
      ajusteCaloricoDesc = 'Igual a TDEE (mantenimiento/salud general)';
  }

  // Macros
  const proteinaGMin = Math.round(perfil.pesoKg * 1.6);
  const proteinaGMax = Math.round(
    perfil.objetivoPrincipal === 'perdida_grasa'
      ? perfil.pesoKg * 2.4
      : perfil.pesoKg * 2.2,
  );
  const grasaGMin = Math.round(perfil.pesoKg * 0.8);
  const grasaGMax = Math.round(perfil.pesoKg * 1.2);

  const proteinaGObjetivo = Math.round((proteinaGMin + proteinaGMax) / 2);
  const grasaGObjetivo = Math.round((grasaGMin + grasaGMax) / 2);
  const kcalProteina = proteinaGObjetivo * 4;
  const kcalGrasa = grasaGObjetivo * 9;
  const kcalCarbos = Math.max(0, caloriasObjetivo - kcalProteina - kcalGrasa);
  const carbosG = Math.round(kcalCarbos / 4);

  const proteinaPct = Math.round((kcalProteina / caloriasObjetivo) * 100);
  const grasaPct = Math.round((kcalGrasa / caloriasObjetivo) * 100);
  const carbosPct = 100 - proteinaPct - grasaPct;

  // Volumen semanal por grupo muscular
  let seriesMin: number, seriesMax: number, volDesc: string;
  switch (perfil.nivelExperiencia) {
    case 'principiante': seriesMin = 8; seriesMax = 12; volDesc = '8–12 series efectivas/semana por grupo muscular'; break;
    case 'intermedio':   seriesMin = 12; seriesMax = 18; volDesc = '12–18 series efectivas/semana por grupo muscular'; break;
    default:             seriesMin = 16; seriesMax = 22; volDesc = '16–22 series efectivas/semana por grupo muscular'; break;
  }

  // Distribución de días
  const distribuciones: Record<number, string> = {
    1: 'Full body (1 día/semana)',
    2: 'Full body x2 o Upper/Lower',
    3: 'Full body x3 o PPL simplificado',
    4: 'Upper/Lower x2 o PPL + Full body',
    5: 'PPL + Upper/Lower o Torso/Pierna x2 + especialización',
    6: 'PPL x2 (Push-Pull-Legs dos veces por semana)',
  };
  const distribucionDias = distribuciones[perfil.diasPorSemana] ?? `${perfil.diasPorSemana} días por semana`;

  // Detección de flags de alto riesgo
  const flagsAltoRiesgo = FLAGS_ALTO_RIESGO
    .filter((f) => f.condicion(perfil))
    .map((f) => f.descripcion);

  const requiereRevisionManualObligatoria = flagsAltoRiesgo.length > 0;

  return {
    edadAnios,
    imc: Math.round(imc * 10) / 10,
    imcCategoria,
    bmr: Math.round(bmr),
    factorActividad,
    tdee,
    caloriasObjetivo,
    ajusteCaloricoDesc,
    macrosObjetivo: {
      proteinaGMin, proteinaGMax,
      grasaGMin, grasaGMax,
      carbosG,
      proteinaPct, carbosPct, grasaPct,
    },
    volumenSemanal: { seriesMin, seriesMax, descripcion: volDesc },
    distribucionDias,
    flagsAltoRiesgo,
    requiereRevisionManualObligatoria,
  };
}

// ─── ETAPA 3: PROMPT BUILDER ─────────────────────────────────────────────────

const SYSTEM_PROMPT = `Sos el Motor IGZ, sistema experto de planificación nutricional y de entrenamiento personalizado para la marca Re-Viva de Igztrainer.

Tu tarea es generar un plan personalizado completo y detallado basado en el perfil del cliente.

REGLAS ABSOLUTAS:
1. Devolvé SOLO un objeto JSON válido. Sin texto adicional, sin bloques markdown, sin explicaciones.
2. El JSON debe seguir EXACTAMENTE la estructura indicada.
3. Todos los cálculos matemáticos deben ser correctos: kcal = proteína*4 + carbos*4 + grasa*9.
4. Respetá todas las restricciones alimentarias, alergias e intolerancias.
5. No uses equipamiento que el cliente no tenga disponible.
6. Si hay lesiones declaradas, evitá ejercicios contraindicados y ofrecé sustitutos seguros.
7. Toda suplementación debe tener respaldo en evidencia científica.
8. Usá nomenclatura en español argentino.
9. La referenciaCientifica del plan de entrenamiento SIEMPRE es "ACSM Position Stand 2025 (PMC12965823)".`;

export function construirPrompt(perfil: ClientProfile, ctx: ProcessedContext): string {
  const flags = perfil.flagsEspeciales ?? [];
  const flagsStr = flags.length > 0 ? flags.join(', ') : 'ninguno';

  return `[CONTEXTO DEL CLIENTE]
Nombre: ${perfil.nombre}
Género: ${perfil.genero}
Edad: ${ctx.edadAnios} años
Peso: ${perfil.pesoKg} kg | Altura: ${perfil.alturaCm} cm
IMC: ${ctx.imc} (${ctx.imcCategoria}) — referencia orientativa, no determinante
Circunferencia cintura: ${perfil.circunferenciaCinturaCm ? perfil.circunferenciaCinturaCm + ' cm' : 'no declarado'}
% grasa estimado: ${perfil.porcentajeGrasaEstimado ?? 'no declarado'}

[OBJETIVO DEL PLAN]
Principal: ${perfil.objetivoPrincipal}
${perfil.objetivoSecundario ? `Secundario: ${perfil.objetivoSecundario}` : ''}
Plazo: ${perfil.plazoObjetivoSemanas ? perfil.plazoObjetivoSemanas + ' semanas' : 'no especificado'}
Estrategia calórica: ${ctx.ajusteCaloricoDesc}
Calorías objetivo: ${ctx.caloriasObjetivo} kcal/día (TDEE: ${ctx.tdee})

[PARÁMETROS DE ENTRENAMIENTO]
Días por semana: ${perfil.diasPorSemana}
Duración por sesión: ${perfil.minutosPorSesion} min
Nivel de experiencia: ${perfil.nivelExperiencia}
Lugar: ${perfil.lugarEntrenamiento}
Equipamiento disponible: ${perfil.equipamientoDisponible.join(', ') || 'peso corporal'}
Distribución óptima: ${ctx.distribucionDias}
Volumen semanal objetivo: ${ctx.volumenSemanal.descripcion}
Nivel de estrés: ${perfil.nivelEstres}/5
Horas de sueño: ${perfil.horasSuenoPromedio}h/noche

[PARÁMETROS NUTRICIONALES]
Calorías diarias: ${ctx.caloriasObjetivo} kcal
Proteína: ${ctx.macrosObjetivo.proteinaGMin}–${ctx.macrosObjetivo.proteinaGMax}g (${ctx.macrosObjetivo.proteinaPct}%)
Carbohidratos: ${ctx.macrosObjetivo.carbosG}g (${ctx.macrosObjetivo.carbosPct}%)
Grasas: ${ctx.macrosObjetivo.grasaGMin}–${ctx.macrosObjetivo.grasaGMax}g (${ctx.macrosObjetivo.grasaPct}%)
Comidas por día: ${perfil.comidasPorDia}
Preferencia dieta: ${perfil.preferenciaDieta ?? 'omnívora'}
Alergias: ${perfil.alergias.length > 0 ? perfil.alergias.join(', ') : 'ninguna'}
Intolerancias: ${perfil.intolerancias.length > 0 ? perfil.intolerancias.join(', ') : 'ninguna'}
Alimentos excluidos: ${perfil.alimentosQueNoConsume.length > 0 ? perfil.alimentosQueNoConsume.join(', ') : 'ninguno'}
Presupuesto semanal: ${perfil.presupuestoSemanalARS ? '$' + perfil.presupuestoSemanalARS + ' ARS' : 'no especificado'}

[SALUD Y LESIONES]
Condiciones médicas declaradas: ${perfil.condicionesMedicasDeclaradas.join(', ') || 'ninguna'}
Lesiones actuales: ${perfil.lesionesActuales.join(', ') || 'ninguna'}
Lesiones pasadas: ${perfil.lesionesPasadas.join(', ') || 'ninguna'}
Medicación actual: ${perfil.medicacionActual.join(', ') || 'ninguna'}
${perfil.notasAdicionales ? `Notas adicionales: ${perfil.notasAdicionales}` : ''}

[FLAGS ESPECIALES ACTIVOS]
${flagsStr}
${flags.includes('perimenopausia') ? '→ Incluir sección anti-inflamatoria y consideraciones hormonales' : ''}
${flags.includes('lumbar_cronico') ? '→ Evitar peso muerto convencional, buenos días, sentadilla con carga axial pesada sin supervisión. Ofrecer sustitutos para core y cadena posterior.' : ''}
${flags.includes('adulto_mayor_65plus') ? '→ Priorizar ejercicios funcionales, trabajo de equilibrio, menor intensidad relativa' : ''}

[BASE DE EVIDENCIA OBLIGATORIA]
- Programación de entrenamiento: ACSM Position Stand 2025 (PMC12965823)
- Suplementación permitida: proteína en polvo, creatina monohidratada, cafeína, omega-3, vitamina D, colágeno hidrolizado + vitamina C
- NO incluir ningún otro suplemento sin evidencia sólida

[ESTRUCTURA JSON REQUERIDA]
Generá un objeto JSON con exactamente esta estructura (los valores son ejemplos):

{
  "planId": "GENERAR_CUID",
  "clientId": "${perfil.id}",
  "generatedAt": "${new Date().toISOString()}",
  "version": 1,
  "resumenEjecutivo": {
    "objetivo": "descripción del objetivo y estrategia en 2-3 oraciones",
    "caloriesDiarias": ${ctx.caloriasObjetivo},
    "macros": { "proteinaG": 150, "carbosG": 250, "grasaG": 70 },
    "hidratacionL": 2.5,
    "diasEntrenamiento": ${perfil.diasPorSemana},
    "volumenSemanalResumen": { "pecho": 14, "espalda": 16, "hombros": 12, "biceps": 10, "triceps": 10, "cuadriceps": 14, "gluteos": 14, "isquiotibiales": 12, "abdomen": 10 }
  },
  "planEntrenamiento": {
    "distribucionSemanal": [
      {
        "dia": 1,
        "nombre": "Día 1 — Empuje superior",
        "gruposObjetivo": ["pecho", "hombros", "tríceps"],
        "duracionEstimadaMin": ${perfil.minutosPorSesion},
        "calentamiento": ["5 min caminata/bicicleta", "movilidad articular hombros"],
        "ejercicios": [
          {
            "nombre": "Press de banca con barra",
            "grupoMuscular": "pecho",
            "series": 4,
            "repeticiones": "8-10",
            "intensidadPct1RM": 70,
            "rir": 2,
            "descansoSeg": 90,
            "tecnicaNotas": "escápulas retraídas y deprimidas",
            "alertas": [],
            "sustitutoEnCasa": "flexiones con pies elevados"
          }
        ],
        "vuelta_a_la_calma": ["estiramiento pectoral 30s c/u", "estiramiento hombros"],
        "notasInstructor": "mantener RIR entre 1-3 en todos los ejercicios"
      }
    ],
    "parametrosGlobales": {
      "intensidadPct1RM": "65-80%",
      "rirObjetivo": "1-3 repeticiones en reserva",
      "progresionSemanal": "aumentar 2.5kg cuando se completen todas las series en el rango superior de repeticiones durante 2 semanas consecutivas",
      "referenciaCientifica": "ACSM Position Stand 2025 (PMC12965823)"
    }
  },
  "planNutricional": {
    "estrategiaCalorica": "descripción de la estrategia",
    "distribucionMacros": { "proteinaPct": ${ctx.macrosObjetivo.proteinaPct}, "carbosPct": ${ctx.macrosObjetivo.carbosPct}, "grasaPct": ${ctx.macrosObjetivo.grasaPct} },
    "timingPeriEntrenamiento": "descripción del timing de comidas alrededor del entrenamiento",
    "ejemploDiaTipo": [
      {
        "comida": "Desayuno",
        "hora": "08:00",
        "ingredientes": [
          { "nombre": "avena", "cantidadG": 80, "proteinaG": 11, "carbosG": 54, "grasaG": 6, "kcal": 310 }
        ],
        "totalesComida": { "proteinaG": 11, "carbosG": 54, "grasaG": 6, "kcal": 310 }
      }
    ],
    "listaCompras": [
      { "categoria": "Proteínas animales", "items": ["pollo pechuga 1.5kg", "huevos x12"] }
    ],
    "hidratacion": "descripción de recomendación de hidratación",
    "suplementacion": [
      { "nombre": "Creatina monohidratada", "dosis": "5g", "timing": "post-entrenamiento o en cualquier momento del día", "evidencia": "Mejora fuerza y potencia en ejercicios de alta intensidad (Kreider et al., 2017)" }
    ]
  },
  "metaInfo": {
    "modeloUsado": "${perfil.flagsEspeciales?.length ? MODELS.escalated : MODELS.standard}",
    "costoGeneracionUSD": 0,
    "requiereRevisionManualObligatoria": ${ctx.requiereRevisionManualObligatoria},
    "flagsDetectados": ${JSON.stringify([...ctx.flagsAltoRiesgo, ...flags])}
  }
}

IMPORTANTE: Reemplazá "GENERAR_CUID" con un ID único aleatorio de 10 caracteres alfanuméricos.
Asegurate de que los totales de macros sean matemáticamente correctos.
Generá el plan completo con TODOS los días de entrenamiento y al menos ${perfil.comidasPorDia} comidas en el día tipo.`;
}

// ─── ETAPA 4: ENGINE EXECUTION ────────────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function llamarMotor(
  prompt: string,
  modelId: string,
  intento = 1,
): Promise<{ plan: GeneratedPlan; tokensInput: number; tokensOutput: number }> {
  const MAX_INTENTOS = 3;

  try {
    const response = await anthropic.messages.create(
      {
        model: modelId,
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      },
      { timeout: 90_000 },
    );

    const raw =
      response.content[0]?.type === 'text' ? response.content[0].text : '';

    // Extraer JSON aunque Claude envuelva en código markdown
    const jsonStr = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    const plan = JSON.parse(jsonStr) as GeneratedPlan;

    return {
      plan,
      tokensInput: response.usage.input_tokens,
      tokensOutput: response.usage.output_tokens,
    };
  } catch (err) {
    if (intento < MAX_INTENTOS) {
      const delay = Math.pow(2, intento) * 1000; // 2s, 4s
      await new Promise((r) => setTimeout(r, delay));
      return llamarMotor(prompt, modelId, intento + 1);
    }
    throw err;
  }
}

// Costo estimado por 1M tokens (USD) — actualizar si cambian precios
const COST_PER_M: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4.0 },
  'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
};

function estimarCosto(model: string, inputTok: number, outputTok: number): number {
  const rates = COST_PER_M[model] ?? { input: 3.0, output: 15.0 };
  return (inputTok / 1_000_000) * rates.input + (outputTok / 1_000_000) * rates.output;
}

// ─── ETAPA 5: OUTPUT ROUTING ─────────────────────────────────────────────────

async function guardarYEnrrutar(
  perfil: ClientProfile,
  ctx: ProcessedContext,
  plan: GeneratedPlan,
  modelId: string,
  tokensInput: number,
  tokensOutput: number,
  promptHash: string,
  proofreaderReport: ProofreaderReport | null,
): Promise<
  | { reviewId: string; regenerada?: false }
  | { reviewId?: undefined; regenerada: true }
> {
  const costUSD = estimarCosto(modelId, tokensInput, tokensOutput);

  // Actualizar metaInfo con costo real
  plan.metaInfo.costoGeneracionUSD = costUSD;
  plan.metaInfo.modeloUsado = modelId;

  const generation = await prisma.planGeneration.create({
    data: {
      clientId: perfil.id,
      promptHash,
      modelUsed: modelId,
      tokensInput,
      tokensOutput,
      costUSD,
      status: 'success',
    },
  });

  // Si el proofreader rechazó el plan, NO lo enviamos a cola de revisión:
  // directo a regeneración automática (salvo que ya alcanzó el límite).
  if (proofreaderReport && proofreaderReport.status === 'rechazado') {
    const intentosPrevios = await prisma.planToRegenerate.count({
      where: { clientId: perfil.id, estado: { not: 'COMPLETADO' } },
    });

    if (intentosPrevios < 2) {
      await prisma.planToRegenerate.create({
        data: {
          clientId: perfil.id,
          originalPlanId: generation.id,
          motivoRechazo: `Proofreader: ${proofreaderReport.resumenParaTrainer}`,
        },
      });
      return { regenerada: true };
    }
    // Si ya alcanzó el límite, cae a la cola manual con prioridad alta.
  }

  // Prioridad:
  // - alta si hay flags de alto riesgo O proofreader rechazó (pero ya se agotó regeneración)
  // - media si proofreader aprobó con observaciones
  // - baja si proofreader aprobó sin observaciones
  let prioridad: 'alta' | 'media' | 'baja';
  if (ctx.requiereRevisionManualObligatoria) {
    prioridad = 'alta';
  } else if (proofreaderReport?.status === 'rechazado') {
    prioridad = 'alta';
  } else if (proofreaderReport?.status === 'aprobado_con_observaciones') {
    prioridad = 'media';
  } else {
    prioridad = 'baja';
  }

  const review = await prisma.pendingTrainerReview.create({
    data: {
      clientId: perfil.id,
      planGenerationId: generation.id,
      planJson: plan as object,
      proofreaderReportJson: proofreaderReport
        ? (proofreaderReport as unknown as object)
        : undefined,
      proofreaderStatus: proofreaderReport?.status ?? null,
      prioridad,
      requiereRevisionManual: ctx.requiereRevisionManualObligatoria,
      flagsDetectados: [
        ...ctx.flagsAltoRiesgo,
        ...(perfil.flagsEspeciales ?? []),
      ],
    },
  });

  return { reviewId: review.id };
}

// ─── PIPELINE PRINCIPAL ───────────────────────────────────────────────────────

export async function correrPipeline(perfil: ClientProfile): Promise<PipelineResult> {
  // Etapa 1: Validación
  const validacion = validarIntake(perfil);
  if (!validacion.valido) {
    return {
      status: 'error_intake',
      error: validacion.errores.map((e) => `${e.campo}: ${e.mensaje}`).join(' | '),
    };
  }

  // Bloqueo por consentimientos
  const c = perfil.consentimientos;
  if (
    !c.aceptaTerminosYCondiciones ||
    !c.aceptaPoliticaPrivacidad ||
    !c.aceptaDescargoMedicoYResponsabilidad ||
    !c.confirmaVeracidadDatos
  ) {
    return { status: 'blocked_consents' };
  }

  // Etapa 2: Processing
  const ctx = procesarPerfil(perfil);

  // Etapa 3: Prompt
  const prompt = construirPrompt(perfil, ctx);
  const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').slice(0, 16);

  // Modelo según riesgo
  const modelId = ctx.requiereRevisionManualObligatoria ? MODELS.escalated : MODELS.standard;

  // Etapa 4: Engine
  let plan: GeneratedPlan;
  let tokensInput = 0, tokensOutput = 0;

  try {
    const resultado = await llamarMotor(prompt, modelId);
    plan = resultado.plan;
    tokensInput = resultado.tokensInput;
    tokensOutput = resultado.tokensOutput;
  } catch (err) {
    // Guardar registro de error en DB
    await prisma.planGeneration.create({
      data: {
        clientId: perfil.id,
        promptHash,
        modelUsed: modelId,
        tokensInput: 0,
        tokensOutput: 0,
        costUSD: 0,
        status: 'error',
        errorMsg: err instanceof Error ? err.message : String(err),
      },
    });

    // Encolar para regeneración
    await prisma.planToRegenerate.create({
      data: {
        clientId: perfil.id,
        motivoRechazo: `Error del motor: ${err instanceof Error ? err.message : 'timeout o fallo de API'}`,
      },
    });

    return { status: 'error_engine', error: 'El motor falló. El plan fue encolado para regeneración automática.' };
  }

  // Etapa 4.5: Proofreader automático
  // Se ejecuta siempre, excepto cuando el plan debe ir obligatoriamente a
  // revisión manual (flags de alto riesgo) — en ese caso el trainer revisa
  // sin pre-validación automática para evitar ruido.
  let proofreaderReport: ProofreaderReport | null = null;
  if (!ctx.requiereRevisionManualObligatoria) {
    try {
      proofreaderReport = ejecutarProofreader(plan, perfil, ctx);
    } catch (err) {
      // Un fallo del proofreader no debe romper el pipeline: queda sin reporte
      // y el plan va a revisión manual normal.
      console.error('[pipeline] proofreader falló:', err);
      proofreaderReport = null;
    }
  }

  // Etapa 5: Routing
  const resultado = await guardarYEnrrutar(
    perfil, ctx, plan, modelId, tokensInput, tokensOutput, promptHash, proofreaderReport,
  );

  // Si el proofreader rechazó y se encoló para regeneración automática
  if (resultado.regenerada) {
    return {
      status: 'queued_regeneracion',
      planId: plan.planId,
      proofreaderStatus: 'rechazado',
      observacionesCount: proofreaderReport?.observaciones.length ?? 0,
    };
  }

  return {
    status: ctx.requiereRevisionManualObligatoria
      ? 'queued_alta_prioridad'
      : 'queued_revision',
    planId: plan.planId,
    reviewId: resultado.reviewId,
    requiereRevisionManual: ctx.requiereRevisionManualObligatoria,
    proofreaderStatus: proofreaderReport?.status,
    observacionesCount: proofreaderReport?.observaciones.length,
  };
}

// ─── MAPPER: NutritionalProfile → ClientProfile ───────────────────────────────
// Convierte el perfil existente de la DB al tipo que consume el pipeline.

import type { NutritionalProfile, User } from '@prisma/client';

export function perfilDbAClientProfile(
  user: User,
  perfil: NutritionalProfile,
  extras: Partial<ClientProfile> = {},
  ip = '0.0.0.0',
): ClientProfile {
  const diasMap: Record<number, 1 | 2 | 3 | 4 | 5 | 6> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
  const dias = (diasMap[perfil.diasEntrenamiento] ?? 3) as 1 | 2 | 3 | 4 | 5 | 6;

  const expMap: Record<string, 'principiante' | 'intermedio' | 'avanzado'> = {
    ninguna: 'principiante', principiante: 'principiante',
    intermedio: 'intermedio', avanzado: 'avanzado',
  };

  const flags: FlagEspecial[] = [];
  if (perfil.flagsEspeciales && Array.isArray(perfil.flagsEspeciales)) {
    for (const f of perfil.flagsEspeciales as string[]) {
      flags.push(f as FlagEspecial);
    }
  }

  // Compatibilidad legacy: si los nuevos arrays están vacíos pero hay valores
  // en los campos viejos (lesiones string, preferenciasAlimentarias string),
  // los usamos como fallback para no perder información de los 19 clientes
  // que se cargaron antes del onboarding extendido.
  const lesionesActuales = perfil.lesionesActuales.length > 0
    ? perfil.lesionesActuales
    : perfil.lesiones ? [perfil.lesiones] : [];

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    fechaNacimiento: perfil.fechaNacimiento
      ? perfil.fechaNacimiento.toISOString().split('T')[0]
      : new Date(new Date().getFullYear() - perfil.edad, 0, 1).toISOString().split('T')[0],
    genero: perfil.genero === 'MASCULINO' ? 'masculino' : 'femenino',
    pesoKg: perfil.peso,
    alturaCm: perfil.altura,
    objetivoPrincipal:
      perfil.objetivo === 'VOLUMEN'
        ? 'ganancia_muscular'
        : perfil.objetivo === 'DEFINICION'
        ? 'perdida_grasa'
        : 'recomposicion',
    diasPorSemana: dias,
    minutosPorSesion: perfil.minutosPorSesion ?? 60,
    nivelExperiencia: expMap[perfil.experiencia ?? 'principiante'] ?? 'principiante',
    lugarEntrenamiento:
      perfil.equipamiento.includes('gym') ? 'gimnasio'
      : perfil.equipamiento.includes('casa') ? 'casa'
      : 'mixto',
    equipamientoDisponible: perfil.equipamiento,
    preferenciaDieta: perfil.preferenciasAlimentarias
      ? (perfil.preferenciasAlimentarias.toLowerCase().includes('vegan')
          ? 'vegana'
          : perfil.preferenciasAlimentarias.toLowerCase().includes('vegeta')
          ? 'vegetariana'
          : 'omnivora')
      : 'omnivora',
    alergias: perfil.alergias,
    intolerancias: perfil.intolerancias,
    alimentosQueNoConsume: perfil.alimentosQueNoConsume,
    comidasPorDia: perfil.comidasPorDia ?? 4,
    condicionesMedicasDeclaradas: perfil.condicionesMedicasDeclaradas,
    lesionesActuales,
    lesionesPasadas: perfil.lesionesPasadas,
    medicacionActual: perfil.medicacionActual,
    nivelEstres:
      perfil.nivelEstres === 'BAJO' ? 2 : perfil.nivelEstres === 'MEDIO' ? 3 : 4,
    horasSuenoPromedio: perfil.horasSueno,
    flagsEspeciales: flags.length > 0 ? flags : undefined,
    consentimientos: {
      aceptaTerminosYCondiciones: perfil.aceptaTerminosYCondiciones,
      aceptaPoliticaPrivacidad: perfil.aceptaPoliticaPrivacidad,
      aceptaDescargoMedicoYResponsabilidad: perfil.aceptaDescargoMedicoYResponsabilidad,
      confirmaVeracidadDatos: perfil.confirmaVeracidadDatos,
      fechaAceptacion: perfil.fechaAceptacionConsentimientos
        ? perfil.fechaAceptacionConsentimientos.toISOString()
        : new Date().toISOString(),
      ipAceptacion: perfil.ipAceptacionConsentimientos ?? ip,
    },
    ...extras,
  };
}
