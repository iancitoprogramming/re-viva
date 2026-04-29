import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ejecutarProofreader } from '../src/lib/plans/proofreader';
import { perfilBase, ctxBase, planValido } from './fixtures/perfil';

describe('proofreader — happy path', () => {
  it('aprueba un plan válido sin observaciones críticas', () => {
    const r = ejecutarProofreader(planValido(), perfilBase(), ctxBase());
    // puede tener observaciones menores (ej. rangos no perfectamente centrados)
    // pero no debe rechazarse
    assert.notEqual(r.status, 'rechazado');
    assert.ok(r.checksEjecutados >= 20);
  });

  it('cada observación tiene severidad válida', () => {
    const r = ejecutarProofreader(planValido(), perfilBase(), ctxBase());
    const sev = ['critica', 'alta', 'media', 'baja'];
    for (const o of r.observaciones) {
      assert.ok(sev.includes(o.severidad), `severidad inválida: ${o.severidad}`);
    }
  });
});

describe('proofreader — check 1 (kcal ingrediente)', () => {
  it('detecta kcal mal calculado en un ingrediente', () => {
    const p = planValido();
    // Romper: avena 80g declara 310 kcal pero ponemos 999
    p.planNutricional.ejemploDiaTipo[0].ingredientes[0].kcal = 999;
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    assert.ok(r.observaciones.some((o) => o.check === 'check_1_kcal_ingrediente'));
  });
});

describe('proofreader — check 2 (suma macros por comida)', () => {
  it('detecta totalesComida inconsistentes con la suma', () => {
    const p = planValido();
    p.planNutricional.ejemploDiaTipo[0].totalesComida.proteinaG = 500;
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    assert.ok(r.observaciones.some((o) => o.check === 'check_2_suma_macros_comida'));
  });
});

describe('proofreader — check 4 (rango proteína)', () => {
  it('rechaza plan con proteína por debajo del mínimo', () => {
    const p = planValido();
    p.resumenEjecutivo.macros.proteinaG = 50; // < 80 * 1.6 = 128
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    const obs = r.observaciones.find((o) => o.check === 'check_4_rango_proteina');
    assert.ok(obs);
    assert.equal(obs!.severidad, 'critica');
    assert.equal(r.status, 'rechazado');
  });

  it('marca como alta la proteína por encima del máximo', () => {
    const p = planValido();
    p.resumenEjecutivo.macros.proteinaG = 500;
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    const obs = r.observaciones.find((o) => o.check === 'check_4_rango_proteina');
    assert.ok(obs);
    assert.equal(obs!.severidad, 'alta');
  });
});

describe('proofreader — check 5 (rango grasa)', () => {
  it('rechaza plan con grasa por debajo del mínimo absoluto', () => {
    const p = planValido();
    p.resumenEjecutivo.macros.grasaG = 10; // < 80 * 0.4 = 32
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    const obs = r.observaciones.find((o) => o.check === 'check_5_rango_grasa');
    assert.ok(obs);
    assert.equal(obs!.severidad, 'critica');
  });
});

describe('proofreader — check 11 (campos ejercicio)', () => {
  it('rechaza plan con ejercicio sin series', () => {
    const p = planValido();
    p.planEntrenamiento.distribucionSemanal[0].ejercicios[0].series = 0;
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    const obs = r.observaciones.find((o) => o.check === 'check_11_campos_ejercicio');
    assert.ok(obs);
    assert.equal(obs!.severidad, 'critica');
  });

  it('rechaza plan con ejercicio sin repeticiones', () => {
    const p = planValido();
    p.planEntrenamiento.distribucionSemanal[0].ejercicios[0].repeticiones = '';
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    assert.ok(r.observaciones.some((o) => o.check === 'check_11_campos_ejercicio'));
  });
});

describe('proofreader — check 12 (equipamiento casa)', () => {
  it('detecta barra requerida sin equipamiento en casa', () => {
    const p = planValido();
    const perfil = perfilBase({
      lugarEntrenamiento: 'casa',
      equipamientoDisponible: ['peso corporal', 'bandas'],
    });
    const r = ejecutarProofreader(p, perfil, ctxBase());
    // Press de banca con barra requiere barra → no disponible en casa
    assert.ok(r.observaciones.some((o) => o.check === 'check_12_equipamiento_casa'));
  });

  it('acepta ejercicio con sustituto en casa declarado', () => {
    const p = planValido();
    // Agregar sustituto a todos los ejercicios
    for (const dia of p.planEntrenamiento.distribucionSemanal) {
      for (const ej of dia.ejercicios) ej.sustitutoEnCasa = 'variante con peso corporal';
    }
    const perfil = perfilBase({
      lugarEntrenamiento: 'casa',
      equipamientoDisponible: ['peso corporal'],
    });
    const r = ejecutarProofreader(p, perfil, ctxBase());
    assert.equal(r.observaciones.filter((o) => o.check === 'check_12_equipamiento_casa').length, 0);
  });
});

describe('proofreader — check 13 (lesiones)', () => {
  it('marca como crítico peso muerto con lesión lumbar activa', () => {
    const p = planValido();
    p.planEntrenamiento.distribucionSemanal[1].ejercicios.push({
      nombre: 'Peso muerto convencional',
      grupoMuscular: 'espalda',
      series: 4,
      repeticiones: '5-8',
      rir: 2,
      descansoSeg: 120,
    });
    const perfil = perfilBase({ lesionesActuales: ['dolor lumbar crónico'] });
    const r = ejecutarProofreader(p, perfil, ctxBase());
    const obs = r.observaciones.find((o) => o.check === 'check_13_lesiones');
    assert.ok(obs);
    assert.equal(obs!.severidad, 'critica');
  });

  it('sin lesiones, no dispara check 13', () => {
    const r = ejecutarProofreader(planValido(), perfilBase(), ctxBase());
    assert.equal(r.observaciones.filter((o) => o.check === 'check_13_lesiones').length, 0);
  });
});

describe('proofreader — check 14 (duración sesión)', () => {
  it('detecta sesión con duración muy distinta a la declarada', () => {
    const p = planValido();
    p.planEntrenamiento.distribucionSemanal[0].duracionEstimadaMin = 120; // 2x lo declarado
    const r = ejecutarProofreader(p, perfilBase({ minutosPorSesion: 60 }), ctxBase());
    assert.ok(r.observaciones.some((o) => o.check === 'check_14_duracion_sesion'));
  });
});

describe('proofreader — check 15 (suplementos permitidos)', () => {
  it('rechaza un suplemento fuera de la lista permitida', () => {
    const p = planValido();
    p.planNutricional.suplementacion.push({
      nombre: 'Tribulus terrestris',
      dosis: '1g',
      timing: 'pre-entrenamiento',
      evidencia: 'ninguna sólida',
    });
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    const obs = r.observaciones.find((o) => o.check === 'check_15_suplementos_permitidos');
    assert.ok(obs);
    assert.equal(obs!.severidad, 'critica');
  });

  it('acepta suplementos de la lista permitida (whey, creatina)', () => {
    const r = ejecutarProofreader(planValido(), perfilBase(), ctxBase());
    assert.equal(r.observaciones.filter((o) => o.check === 'check_15_suplementos_permitidos').length, 0);
  });
});

describe('proofreader — check 16 (dosis suplementos)', () => {
  it('marca dosis de creatina excesiva', () => {
    const p = planValido();
    p.planNutricional.suplementacion[0].dosis = '50g'; // creatina, máx 10g
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    assert.ok(r.observaciones.some((o) => o.check === 'check_16_dosis_suplementos'));
  });
});

describe('proofreader — check 17 (evidencia suplementos)', () => {
  it('marca suplemento sin evidencia citada', () => {
    const p = planValido();
    p.planNutricional.suplementacion[0].evidencia = '';
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    assert.ok(r.observaciones.some((o) => o.check === 'check_17_evidencia_suplementos'));
  });
});

describe('proofreader — check 18 (coherencia días)', () => {
  it('detecta desfase entre días declarados y generados', () => {
    const r = ejecutarProofreader(planValido(), perfilBase({ diasPorSemana: 5 }), ctxBase());
    // planValido tiene 4 días, perfil declara 5 → debe quejarse
    assert.ok(r.observaciones.some((o) => o.check === 'check_18_coherencia_dias'));
  });
});

describe('proofreader — check 19 (coherencia comidas)', () => {
  it('detecta menos comidas que las declaradas', () => {
    const r = ejecutarProofreader(planValido(), perfilBase({ comidasPorDia: 6 }), ctxBase());
    assert.ok(r.observaciones.some((o) => o.check === 'check_19_coherencia_comidas'));
  });
});

describe('proofreader — check 20 (coherencia legal)', () => {
  it('detecta ausencia de referencia ACSM', () => {
    const p = planValido();
    p.planEntrenamiento.parametrosGlobales.referenciaCientifica = 'cualquier cosa';
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    assert.ok(r.observaciones.some((o) => o.check === 'check_20_coherencia_legal'));
  });

  it('detecta claims médicas prohibidas ("cura")', () => {
    const p = planValido();
    p.resumenEjecutivo.objetivo = 'Este plan cura la diabetes y reemplaza la medicación.';
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    const obsCritica = r.observaciones.find(
      (o) => o.check === 'check_20_coherencia_legal' && o.severidad === 'critica',
    );
    assert.ok(obsCritica);
    assert.equal(r.status, 'rechazado');
  });
});

describe('proofreader — clasificación de status', () => {
  it('ningún problema → aprobado', () => {
    const r = ejecutarProofreader(planValido(), perfilBase(), ctxBase());
    // Un plan válido debería aprobar directamente
    assert.notEqual(r.status, 'rechazado');
  });

  it('crítica → rechazado', () => {
    const p = planValido();
    p.resumenEjecutivo.macros.proteinaG = 20; // crítica
    const r = ejecutarProofreader(p, perfilBase(), ctxBase());
    assert.equal(r.status, 'rechazado');
  });

  it('resumenParaTrainer siempre está poblado', () => {
    const r = ejecutarProofreader(planValido(), perfilBase(), ctxBase());
    assert.ok(r.resumenParaTrainer.length > 0);
  });
});
