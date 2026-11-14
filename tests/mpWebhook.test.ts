import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'crypto'

import { firmaValida, urlNotificacion } from '../src/lib/mpWebhook'

const secret = 'clave-de-prueba'
const firmar = (manifest: string) => createHmac('sha256', secret).update(manifest).digest('hex')

test('acepta una firma armada como la arma Mercado Pago', () => {
  const v1 = firmar('id:123456;request-id:req-1;ts:1700000000;')
  assert.equal(firmaValida({ xSignature: `ts=1700000000,v1=${v1}`, xRequestId: 'req-1', dataId: '123456', secret }), true)
})

test('tolera espacios en el header y data.id en mayúsculas', () => {
  const v1 = firmar('id:abc123;request-id:req-1;ts:1700000000;')
  assert.equal(firmaValida({ xSignature: `ts=1700000000, v1=${v1}`, xRequestId: 'req-1', dataId: 'ABC123', secret }), true)
})

test('sin x-request-id el manifest lo omite', () => {
  const v1 = firmar('id:123456;ts:1700000000;')
  assert.equal(firmaValida({ xSignature: `ts=1700000000,v1=${v1}`, xRequestId: null, dataId: '123456', secret }), true)
})

test('rechaza firma de otro id, otra clave o header incompleto', () => {
  const v1 = firmar('id:123456;request-id:req-1;ts:1700000000;')
  assert.equal(firmaValida({ xSignature: `ts=1700000000,v1=${v1}`, xRequestId: 'req-1', dataId: '999', secret }), false)
  assert.equal(firmaValida({ xSignature: `ts=1700000000,v1=${v1}`, xRequestId: 'req-1', dataId: '123456', secret: 'otra' }), false)
  assert.equal(firmaValida({ xSignature: `v1=${v1}`, xRequestId: 'req-1', dataId: '123456', secret }), false)
  assert.equal(firmaValida({ xSignature: null, xRequestId: 'req-1', dataId: '123456', secret }), false)
})

test('la URL de aviso pide solo webhooks', () => {
  process.env.NEXT_PUBLIC_BASE_URL = 'https://www.revivabyigz.com'
  assert.equal(urlNotificacion(), 'https://www.revivabyigz.com/api/payments/webhook?source_news=webhooks')
})
