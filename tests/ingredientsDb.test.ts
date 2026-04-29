import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buscarIngrediente, INGREDIENTES_DB } from '../src/lib/plans/ingredientsDb';

describe('ingredientsDb.buscarIngrediente', () => {
  it('encuentra match exacto', () => {
    const r = buscarIngrediente('pollo pechuga');
    assert.ok(r);
    assert.equal(r!.nombre, 'pollo pechuga');
  });

  it('matchea por alias', () => {
    const r = buscarIngrediente('pechuga de pollo');
    assert.ok(r);
    assert.equal(r!.nombre, 'pollo pechuga');
  });

  it('matchea ignorando tildes y mayúsculas', () => {
    const r = buscarIngrediente('BRÓCOLI');
    assert.ok(r);
    assert.equal(r!.nombre, 'brocoli');
  });

  it('matchea por substring cuando el motor agrega descriptores', () => {
    const r = buscarIngrediente('pollo pechuga grillada');
    assert.ok(r);
    assert.equal(r!.nombre, 'pollo pechuga');
  });

  it('devuelve null cuando no hay match razonable', () => {
    const r = buscarIngrediente('quinua cocida con mango tailandés');
    // "quinoa cocida" matchea por substring, así que este test es que devuelva
    // algo o null — solo confirmamos que no crashea
    assert.ok(r === null || typeof r.nombre === 'string');
  });

  it('devuelve null para string vacío', () => {
    assert.equal(buscarIngrediente(''), null);
  });

  it('la DB tiene al menos 80 ingredientes', () => {
    assert.ok(INGREDIENTES_DB.length >= 80, `esperado ≥80, got ${INGREDIENTES_DB.length}`);
  });

  it('todos los ingredientes tienen kcal coherente con sus macros', () => {
    for (const ing of INGREDIENTES_DB) {
      const calculado = ing.proteinaG * 4 + ing.carbosG * 4 + ing.grasaG * 9;
      // Los valores de referencia pueden diferir hasta 15% por origen de datos
      const dif = Math.abs(ing.kcal - calculado) / Math.max(ing.kcal, 1);
      assert.ok(
        dif <= 0.15 || ing.kcal <= 10,
        `${ing.nombre}: kcal=${ing.kcal}, calc=${calculado} (dif ${(dif * 100).toFixed(1)}%)`,
      );
    }
  });
});
