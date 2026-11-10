import { test } from 'node:test'
import assert from 'node:assert/strict'

import { esPlanSuscribible, mesesPorCobro, nuevoVencimiento, sumarMeses } from '../src/lib/periodoSuscripcion'

const d = (iso: string) => new Date(`${iso}T12:00:00Z`)

test('sumarMeses respeta el fin de mes', () => {
  assert.deepEqual(sumarMeses(d('2026-01-31'), 1), d('2026-02-28'))
  assert.deepEqual(sumarMeses(d('2028-01-31'), 1), d('2028-02-29'))
  assert.deepEqual(sumarMeses(d('2026-11-15'), 3), d('2027-02-15'))
  assert.deepEqual(sumarMeses(d('2026-12-10'), 1), d('2027-01-10'))
})

test('mesesPorCobro: mensual 1, trimestral 3', () => {
  assert.equal(mesesPorCobro('online-mensual'), 1)
  assert.equal(mesesPorCobro('individual-3x-trimestral'), 3)
})

test('nuevoVencimiento suma al vencimiento vigente', () => {
  const ahora = d('2026-11-10')
  assert.deepEqual(nuevoVencimiento(d('2026-11-20'), 'online-mensual', ahora), d('2026-12-20'))
})

test('nuevoVencimiento arranca de hoy si el plan estaba vencido o sin fecha', () => {
  const ahora = d('2026-11-10')
  assert.deepEqual(nuevoVencimiento(d('2026-06-01'), 'online-mensual', ahora), d('2026-12-10'))
  assert.deepEqual(nuevoVencimiento(null, 'online-mensual', ahora), d('2026-12-10'))
})

test('solo se suscriben los planes con débito automático', () => {
  assert.equal(esPlanSuscribible('online-mensual'), true)
  assert.equal(esPlanSuscribible('on-demand'), false)
  assert.equal(esPlanSuscribible('ebook-gluteos'), false)
  assert.equal(esPlanSuscribible('__proto__'), false)
})
