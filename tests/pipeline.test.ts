import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validarIntake, procesarPerfil } from '../src/lib/plans/pipeline';
import { perfilBase } from './fixtures/perfil';

describe('pipeline.validarIntake', () => {
  it('perfil base válido pasa', () => {
    const r = validarIntake(perfilBase());
    assert.equal(r.valido, true);
    assert.equal(r.errores.length, 0);
  });

  it('detecta campos obligatorios faltantes', () => {
    const r = validarIntake(perfilBase({ email: '' }));
    assert.equal(r.valido, false);
    assert.ok(r.errores.some((e) => e.campo === 'email'));
  });

  it('rechaza peso fuera de rango', () => {
    const r = validarIntake(perfilBase({ pesoKg: 15 }));
    assert.equal(r.valido, false);
    assert.ok(r.errores.some((e) => e.campo === 'pesoKg'));
  });

  it('rechaza altura fuera de rango', () => {
    const r = validarIntake(perfilBase({ alturaCm: 50 }));
    assert.equal(r.valido, false);
    assert.ok(r.errores.some((e) => e.campo === 'alturaCm'));
  });

  it('rechaza comidas por día fuera de rango', () => {
    const r = validarIntake(perfilBase({ comidasPorDia: 15 }));
    assert.equal(r.valido, false);
    assert.ok(r.errores.some((e) => e.campo === 'comidasPorDia'));
  });

  it('rechaza si no acepta términos', () => {
    const p = perfilBase();
    p.consentimientos.aceptaTerminosYCondiciones = false;
    const r = validarIntake(p);
    assert.equal(r.valido, false);
    assert.ok(r.errores.some((e) => e.campo.includes('aceptaTerminos')));
  });

  it('rechaza si no acepta descargo médico', () => {
    const p = perfilBase();
    p.consentimientos.aceptaDescargoMedicoYResponsabilidad = false;
    const r = validarIntake(p);
    assert.equal(r.valido, false);
  });
});

describe('pipeline.procesarPerfil', () => {
  it('calcula BMR con Mifflin-St Jeor para hombre', () => {
    const p = perfilBase({
      genero: 'masculino',
      pesoKg: 80,
      alturaCm: 180,
      fechaNacimiento: '1990-01-01',
    });
    const ctx = procesarPerfil(p);
    // 10*80 + 6.25*180 - 5*edad + 5 → ~1745 para 36 años
    assert.ok(ctx.bmr > 1700 && ctx.bmr < 1800, `BMR=${ctx.bmr}`);
  });

  it('calcula BMR distinto para mujer (-166 respecto al hombre)', () => {
    const hombre = procesarPerfil(perfilBase({ genero: 'masculino' }));
    const mujer = procesarPerfil(perfilBase({ genero: 'femenino' }));
    assert.equal(hombre.bmr - mujer.bmr, 166);
  });

  it('factor de actividad 1.375 con 2 días/semana', () => {
    const ctx = procesarPerfil(perfilBase({ diasPorSemana: 2 }));
    assert.equal(ctx.factorActividad, 1.375);
  });

  it('factor de actividad 1.725 con 6 días/semana', () => {
    const ctx = procesarPerfil(perfilBase({ diasPorSemana: 6 }));
    assert.equal(ctx.factorActividad, 1.725);
  });

  it('objetivo perdida_grasa aplica déficit 18%', () => {
    const ctx = procesarPerfil(perfilBase({ objetivoPrincipal: 'perdida_grasa' }));
    // caloriasObjetivo ≈ tdee * 0.82
    const ratio = ctx.caloriasObjetivo / ctx.tdee;
    assert.ok(Math.abs(ratio - 0.82) < 0.01, `ratio=${ratio}`);
  });

  it('objetivo ganancia_muscular aplica superávit 10%', () => {
    const ctx = procesarPerfil(perfilBase({ objetivoPrincipal: 'ganancia_muscular' }));
    const ratio = ctx.caloriasObjetivo / ctx.tdee;
    assert.ok(Math.abs(ratio - 1.10) < 0.01, `ratio=${ratio}`);
  });

  it('rango de proteína: [pesoKg * 1.6, pesoKg * 2.4]', () => {
    const peso = 80;
    const ctx = procesarPerfil(perfilBase({ pesoKg: peso, objetivoPrincipal: 'perdida_grasa' }));
    assert.equal(ctx.macrosObjetivo.proteinaGMin, Math.round(peso * 1.6));
    assert.equal(ctx.macrosObjetivo.proteinaGMax, Math.round(peso * 2.4));
  });

  it('detecta flag de alto riesgo: embarazo', () => {
    const ctx = procesarPerfil(perfilBase({ flagsEspeciales: ['embarazo'] }));
    assert.equal(ctx.requiereRevisionManualObligatoria, true);
    assert.ok(ctx.flagsAltoRiesgo.length > 0);
  });

  it('detecta flag de alto riesgo: adulto mayor', () => {
    const ctx = procesarPerfil(perfilBase({ flagsEspeciales: ['adulto_mayor_65plus'] }));
    assert.equal(ctx.requiereRevisionManualObligatoria, true);
  });

  it('detecta flag de alto riesgo: cardíaco + alta frecuencia', () => {
    const ctx = procesarPerfil(perfilBase({
      condicionesMedicasDeclaradas: ['problema cardíaco leve'],
      diasPorSemana: 6,
    }));
    assert.equal(ctx.requiereRevisionManualObligatoria, true);
  });

  it('perfil sano no dispara revisión obligatoria', () => {
    const ctx = procesarPerfil(perfilBase());
    assert.equal(ctx.requiereRevisionManualObligatoria, false);
    assert.equal(ctx.flagsAltoRiesgo.length, 0);
  });

  it('volumen semanal escalado con la experiencia', () => {
    const principiante = procesarPerfil(perfilBase({ nivelExperiencia: 'principiante' }));
    const avanzado = procesarPerfil(perfilBase({ nivelExperiencia: 'avanzado' }));
    assert.ok(principiante.volumenSemanal.seriesMax < avanzado.volumenSemanal.seriesMax);
  });
});
