// scripts/test-pipeline.ts
// Smoke test end-to-end del pipeline de generación de planes.
//
// Uso:
//   npx tsx scripts/test-pipeline.ts [--dry-run] [--userId=<id>]
//
// Si --dry-run: arma el perfil, calcula contexto y construye el prompt SIN
//   llamar a Anthropic ni escribir en la DB. Útil para validar que todo el
//   pipeline funciona antes de gastar tokens.
//
// Si --userId=<id>: usa un perfil existente en DB (y persiste el resultado).
// Sin --userId: usa un perfil sintético "saludable" definido abajo.
//
// Requiere: ANTHROPIC_API_KEY + DATABASE_URL (salvo --dry-run).

import 'dotenv/config';
import {
  correrPipeline,
  validarIntake,
  procesarPerfil,
  construirPrompt,
  perfilDbAClientProfile,
} from '../src/lib/plans/pipeline';
import { ejecutarProofreader } from '../src/lib/plans/proofreader';
import type { ClientProfile, GeneratedPlan } from '../src/lib/plans/types';

function parseArgs(): { dryRun: boolean; userId?: string } {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const userArg = args.find((a) => a.startsWith('--userId='));
  return { dryRun, userId: userArg?.split('=')[1] };
}

function perfilSintetico(): ClientProfile {
  return {
    id: 'u_smoke_001',
    nombre: 'Cliente Sintético',
    email: 'smoke@reviva.ar',
    fechaNacimiento: '1988-06-15',
    genero: 'masculino',
    pesoKg: 82,
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
      fechaAceptacion: new Date().toISOString(),
      ipAceptacion: '127.0.0.1',
    },
  };
}

function hr(titulo: string): void {
  console.log(`\n── ${titulo} ${'─'.repeat(Math.max(0, 70 - titulo.length))}`);
}

async function main(): Promise<void> {
  const { dryRun, userId } = parseArgs();
  const t0 = Date.now();

  let perfil: ClientProfile;

  if (userId) {
    hr(`Cargando perfil de DB: ${userId}`);
    const { prisma } = await import('../src/lib/prisma');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { perfil: true },
    });
    if (!user || !user.perfil) {
      console.error('X Usuario sin perfil. Abortando.');
      process.exit(2);
    }
    perfil = perfilDbAClientProfile(user, user.perfil, {}, '127.0.0.1');
  } else {
    hr('Usando perfil sintético');
    perfil = perfilSintetico();
  }

  console.log(`  → ${perfil.nombre} <${perfil.email}> | ${perfil.objetivoPrincipal}`);
  console.log(`  → ${perfil.pesoKg}kg / ${perfil.alturaCm}cm / ${perfil.diasPorSemana}d/sem`);

  hr('Etapa 1: Intake');
  const val = validarIntake(perfil);
  if (!val.valido) {
    console.error('X Intake inválido:');
    for (const e of val.errores) console.error(`    - ${e.campo}: ${e.mensaje}`);
    process.exit(3);
  }
  console.log(`  OK ${val.errores.length} errores.`);

  hr('Etapa 2: Processing');
  const ctx = procesarPerfil(perfil);
  console.log(`  BMR: ${ctx.bmr} kcal`);
  console.log(`  TDEE: ${ctx.tdee} kcal (factor ${ctx.factorActividad})`);
  console.log(`  Objetivo: ${ctx.caloriasObjetivo} kcal — ${ctx.ajusteCaloricoDesc}`);
  console.log(
    `  Macros: P ${ctx.macrosObjetivo.proteinaGMin}-${ctx.macrosObjetivo.proteinaGMax}g | C ${ctx.macrosObjetivo.carbosG}g | G ${ctx.macrosObjetivo.grasaGMin}-${ctx.macrosObjetivo.grasaGMax}g`,
  );
  console.log(`  Volumen: ${ctx.volumenSemanal.descripcion}`);
  console.log(`  Flags alto riesgo: ${ctx.flagsAltoRiesgo.join(', ') || 'ninguno'}`);

  hr('Etapa 3: Prompt');
  const prompt = construirPrompt(perfil, ctx);
  console.log(`  Longitud prompt: ${prompt.length} chars (~${Math.round(prompt.length / 4)} tokens)`);

  if (dryRun) {
    hr('DRY RUN — Simulando proofreader contra un plan inválido');
    // En dry-run también probamos el proofreader con un plan sintético
    const planFake: GeneratedPlan = {
      planId: 'dry_run',
      clientId: perfil.id,
      generatedAt: new Date().toISOString(),
      version: 1,
      resumenEjecutivo: {
        objetivo: 'test',
        caloriesDiarias: ctx.caloriasObjetivo,
        macros: { proteinaG: ctx.macrosObjetivo.proteinaGMin, carbosG: ctx.macrosObjetivo.carbosG, grasaG: ctx.macrosObjetivo.grasaGMin },
        hidratacionL: 2.5,
        diasEntrenamiento: perfil.diasPorSemana,
        volumenSemanalResumen: {},
      },
      planEntrenamiento: {
        distribucionSemanal: [],
        parametrosGlobales: {
          intensidadPct1RM: '70%',
          rirObjetivo: '2',
          progresionSemanal: 'lineal',
          referenciaCientifica: 'ACSM Position Stand 2025 (PMC12965823)',
        },
      },
      planNutricional: {
        estrategiaCalorica: 'test',
        distribucionMacros: { proteinaPct: 25, carbosPct: 50, grasaPct: 25 },
        timingPeriEntrenamiento: 'test',
        ejemploDiaTipo: [],
        listaCompras: [],
        hidratacion: 'test',
        suplementacion: [],
      },
      metaInfo: {
        modeloUsado: 'dry-run',
        costoGeneracionUSD: 0,
        requiereRevisionManualObligatoria: false,
        flagsDetectados: [],
      },
    };
    const report = ejecutarProofreader(planFake, perfil, ctx);
    console.log(`  Proofreader: ${report.status} (${report.observaciones.length} observaciones)`);
    console.log(`  Resumen: ${report.resumenParaTrainer}`);
    hr('COMPLETADO (dry-run)');
    console.log(`  Duración: ${Date.now() - t0}ms`);
    return;
  }

  hr('Etapas 4-5: Engine + Proofreader + Routing');
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('X ANTHROPIC_API_KEY no definida. Abortando. (usá --dry-run para skip)');
    process.exit(4);
  }

  console.log('  Llamando al motor (puede tardar 30-60s)...');
  const resultado = await correrPipeline(perfil);

  hr('Resultado final');
  console.log(JSON.stringify(resultado, null, 2));

  hr('COMPLETADO');
  console.log(`  Duración total: ${Date.now() - t0}ms`);
}

main().catch((err) => {
  console.error('\nX Error en pipeline:');
  console.error(err);
  process.exit(1);
});
