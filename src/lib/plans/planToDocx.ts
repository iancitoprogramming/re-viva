import { generarPlanDOCX, type SeccionDocx, type FilaTabla } from './docxGenerator';
import type { GeneratedPlan } from './types';

function tablaEjercicios(ejercicios: GeneratedPlan['planEntrenamiento']['distribucionSemanal'][0]['ejercicios']): FilaTabla[] {
  const filas: FilaTabla[] = [
    {
      celdas: ['Ejercicio', 'Grupos', 'Series', 'Reps', 'RIR', 'Descanso'],
      esEncabezado: true,
    },
  ];
  for (const ej of ejercicios) {
    filas.push({
      celdas: [
        ej.nombre,
        ej.grupoMuscular,
        String(ej.series),
        ej.repeticiones,
        String(ej.rir),
        `${ej.descansoSeg}s`,
      ],
    });
    if (ej.tecnicaNotas || ej.alertas?.length || ej.sustitutoEnCasa) {
      const notas = [
        ej.tecnicaNotas ? `Técnica: ${ej.tecnicaNotas}` : null,
        ej.alertas?.length ? `⚠️ ${ej.alertas.join('; ')}` : null,
        ej.sustitutoEnCasa ? `Casa: ${ej.sustitutoEnCasa}` : null,
      ]
        .filter(Boolean)
        .join(' · ');
      filas.push({ celdas: ['', notas, '', '', '', ''] });
    }
  }
  return filas;
}

function tablaComida(
  items: GeneratedPlan['planNutricional']['ejemploDiaTipo'][0]['ingredientes'],
  totales: GeneratedPlan['planNutricional']['ejemploDiaTipo'][0]['totalesComida'],
): FilaTabla[] {
  const filas: FilaTabla[] = [
    {
      celdas: ['Alimento', 'Gramos', 'Prot', 'Carbs', 'Grasa', 'kcal'],
      esEncabezado: true,
    },
  ];
  for (const item of items) {
    filas.push({
      celdas: [
        item.nombre,
        `${item.cantidadG}g`,
        `${item.proteinaG}g`,
        `${item.carbosG}g`,
        `${item.grasaG}g`,
        `${item.kcal}`,
      ],
    });
  }
  filas.push({
    celdas: ['TOTAL', '', `${totales.proteinaG}g`, `${totales.carbosG}g`, `${totales.grasaG}g`, `${totales.kcal} kcal`],
    esEncabezado: true,
  });
  return filas;
}

export function planASecciones(plan: GeneratedPlan): SeccionDocx[] {
  const secciones: SeccionDocx[] = [];

  // ── Resumen Ejecutivo ────────────────────────────────────────────────────
  const re = plan.resumenEjecutivo;
  secciones.push({
    titulo: 'Resumen Ejecutivo',
    paragrafos: [{ texto: re.objetivo }],
    tablas: [
      {
        filas: [
          { celdas: ['Calorías', 'Proteína', 'Carbohidratos', 'Grasas', 'Hidratación'], esEncabezado: true },
          {
            celdas: [
              `${re.caloriesDiarias} kcal`,
              `${re.macros.proteinaG}g`,
              `${re.macros.carbosG}g`,
              `${re.macros.grasaG}g`,
              `${re.hidratacionL}L`,
            ],
          },
        ],
        anchosPct: [20, 20, 20, 20, 20],
      },
    ],
  });

  // ── Plan de Entrenamiento ─────────────────────────────────────────────────
  const pt = plan.planEntrenamiento;
  const entrenSec: SeccionDocx = {
    titulo: 'Plan de Entrenamiento',
    paragrafos: [
      {
        texto: `Intensidad: ${pt.parametrosGlobales.intensidadPct1RM} · RIR objetivo: ${pt.parametrosGlobales.rirObjetivo}`,
      },
      { texto: `Progresión: ${pt.parametrosGlobales.progresionSemanal}` },
      {
        texto: `Referencia científica: ${pt.parametrosGlobales.referenciaCientifica}`,
      },
    ],
    tablas: [],
  };

  for (const dia of pt.distribucionSemanal) {
    entrenSec.paragrafos = entrenSec.paragrafos ?? [];
    entrenSec.paragrafos.push(
      { texto: `${dia.nombre}`, esSubtitulo: true, nivelSubtitulo: 2 },
      { texto: `Grupos objetivo: ${dia.gruposObjetivo.join(', ')} · Duración estimada: ${dia.duracionEstimadaMin} min` },
      { texto: `Calentamiento: ${dia.calentamiento.join(' · ')}` },
    );
    entrenSec.tablas = entrenSec.tablas ?? [];
    entrenSec.tablas.push({
      filas: tablaEjercicios(dia.ejercicios),
      anchosPct: [30, 15, 8, 8, 6, 8],
    });
    entrenSec.paragrafos.push(
      { texto: `Vuelta a la calma: ${dia.vuelta_a_la_calma.join(' · ')}` },
      { texto: dia.notasInstructor },
    );
  }

  secciones.push(entrenSec);

  // ── Plan Nutricional ──────────────────────────────────────────────────────
  const pn = plan.planNutricional;
  const nutriSec: SeccionDocx = {
    titulo: 'Plan Nutricional',
    esNutricional: true,
    paragrafos: [
      { texto: pn.estrategiaCalorica },
      {
        texto: `Distribución: ${pn.distribucionMacros.proteinaPct}% Prot · ${pn.distribucionMacros.carbosPct}% Carbs · ${pn.distribucionMacros.grasaPct}% Grasas`,
      },
      { texto: `Timing peri-entrenamiento: ${pn.timingPeriEntrenamiento}` },
      { texto: `Hidratación: ${pn.hidratacion}` },
    ],
    tablas: [],
  };

  // Día tipo
  for (const comida of pn.ejemploDiaTipo) {
    nutriSec.paragrafos = nutriSec.paragrafos ?? [];
    nutriSec.paragrafos.push({
      texto: `${comida.comida} — ${comida.hora}`,
      esSubtitulo: true,
      nivelSubtitulo: 2,
    });
    nutriSec.tablas = nutriSec.tablas ?? [];
    nutriSec.tablas.push({
      filas: tablaComida(comida.ingredientes, comida.totalesComida),
      anchosPct: [35, 10, 11, 11, 11, 12],
    });
  }

  secciones.push(nutriSec);

  // ── Suplementación ────────────────────────────────────────────────────────
  if (pn.suplementacion.length > 0) {
    secciones.push({
      titulo: 'Suplementación',
      paragrafos: [],
      tablas: [
        {
          filas: [
            { celdas: ['Suplemento', 'Dosis', 'Timing', 'Evidencia'], esEncabezado: true },
            ...pn.suplementacion.map((s) => ({
              celdas: [s.nombre, s.dosis, s.timing, s.evidencia],
            })),
          ],
          anchosPct: [20, 15, 25, 40],
        },
      ],
    });
  }

  // ── Lista de Compras ──────────────────────────────────────────────────────
  if (pn.listaCompras.length > 0) {
    const comprasRows: FilaTabla[] = [
      { celdas: ['Categoría', 'Ítems'], esEncabezado: true },
    ];
    for (const cat of pn.listaCompras) {
      comprasRows.push({ celdas: [cat.categoria, cat.items.join(', ')] });
    }
    secciones.push({
      titulo: 'Lista de Compras',
      paragrafos: [],
      tablas: [{ filas: comprasRows, anchosPct: [25, 75] }],
    });
  }

  // ── Secciones especiales ──────────────────────────────────────────────────
  if (pn.seccionesEspeciales?.length) {
    secciones.push({
      titulo: 'Consideraciones Especiales',
      paragrafos: pn.seccionesEspeciales.map((t) => ({ texto: t })),
    });
  }

  return secciones;
}

export async function generarDocxDePlan(
  plan: GeneratedPlan,
  clienteNombre: string,
  clienteEmail: string,
): Promise<Buffer> {
  const secciones = planASecciones(plan);
  return generarPlanDOCX({
    cliente: { nombre: clienteNombre, email: clienteEmail },
    fechaEmision: new Date(),
    secciones,
  });
}
