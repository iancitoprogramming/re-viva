import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { construirFichaCliente } from '../src/lib/fichaCliente';
import type { OnboardingData } from '../src/types';

const igz = { clasificacion: 'DEFINICION', calorias: 2100, proteina: 210, hidratos: 158, grasas: 70 } as const;

function perfil(extra: Partial<OnboardingData> = {}): OnboardingData {
  return {
    genero: 'MASCULINO', edad: 41, altura: 178, peso: 88, objetivo: 'DEFINICION',
    diasEntrenamiento: 3, nivelEstres: 'MEDIO', horasSueno: 7, adherencia: 'MEDIA',
    horarioEntrenamiento: 'manana', disponibilidadDomingo: 'no', comeAfuera: '1-2',
    sesionesCocina: 'dos', supermercado: 'coto', obstaculos: ['que_comer'],
    resultadoSonado: 'Bajar 8 kilos para marzo',
    aceptaTerminosYCondiciones: true, aceptaPoliticaPrivacidad: true,
    aceptaDescargoMedicoYResponsabilidad: true, confirmaVeracidadDatos: true,
    ...extra,
  } as OnboardingData;
}

describe('construirFichaCliente', () => {
  it('arma el prompt con el formato de la ficha y el pre-cálculo IGZ', () => {
    const { prompt, alertas } = construirFichaCliente({
      nombre: 'Juan Pérez', email: 'juan@ejemplo.com', creadoEn: new Date('2026-11-15T15:00:00Z'), perfil: perfil(), igz,
    });
    assert.match(prompt, /^# NUEVO CLIENTE RE-VIVA — Juan Pérez/);
    assert.match(prompt, /## 2\. Pre-cálculo Motor IGZ/);
    assert.match(prompt, /2100 kcal · P 210 g/);
    assert.match(prompt, /Franja de entrenamiento: Mañana \(antes de las 11\)/);
    assert.match(prompt, /Supermercado: Coto/);
    assert.match(prompt, /## Instrucción al agente/);
    assert.deepEqual(alertas, [{ tipo: 'ok', texto: 'Entrena 3x: FBEOD + DUP en Lunes / Miércoles / Viernes.' }]);
  });

  it('marca consentimientos faltantes, lesión actual y guía para comer afuera', () => {
    const { alertas } = construirFichaCliente({
      nombre: 'Ana', email: 'ana@ejemplo.com', creadoEn: new Date(), igz,
      perfil: perfil({ confirmaVeracidadDatos: false, lesionesActuales: ['Hombro derecho'], comeAfuera: '3-5', diasEntrenamiento: 4 }),
    });
    const textos = alertas.map(a => `${a.tipo}: ${a.texto}`);
    assert.ok(textos.some(t => t.startsWith('stop: No aceptó todos los consentimientos')));
    assert.ok(textos.some(t => t.startsWith('stop: Lesión actual declarada (Hombro derecho)')));
    assert.ok(textos.some(t => t.startsWith('aviso: Come afuera 3 o más')));
  });
});
