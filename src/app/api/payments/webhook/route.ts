// POST /api/payments/webhook
// Recibe notificaciones asíncronas de Mercado Pago.
// Sin auth JWT: valida la firma con MP_WEBHOOK_SECRET.
// Si algo falla de nuestro lado responde 500 para que MP reintente.
//
// Eventos que atiende (hay que tildarlos en el panel de MP):
//   · payment                   → pagos del checkout y cobros de suscripciones
//   · subscription_preapproval  → alta, pausa o baja de un débito automático

import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { registrarResultadoPago } from '@/lib/pagos'
import { actualizarEstadoSuscripcion, buscarSuscripcion, registrarCobroSuscripcion } from '@/lib/suscripciones'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

function firmaValida(request: Request, dataId: string, secret: string): boolean {
  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''
  const partes = Object.fromEntries(
    xSignature.split(',').map(p => p.trim().split('=') as [string, string]),
  )
  if (!partes.ts || !partes.v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${partes.ts};`
  const esperado = createHmac('sha256', secret).update(manifest).digest('hex')
  const a = Buffer.from(esperado)
  const b = Buffer.from(partes.v1)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function procesarPago(dataId: string): Promise<void> {
  const mpPayment = await new Payment(mp).get({ id: dataId })
  const estado = mpPayment.status ?? 'unknown'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const crudo = mpPayment as any
  const preferenceId = crudo.preference_id as string | undefined
  const referencia = mpPayment.external_reference

  // 1. Pago del checkout propio
  const pago =
    (referencia && await prisma.payment.findUnique({ where: { id: referencia } })) ||
    (preferenceId && await prisma.payment.findFirst({ where: { preferenceId } })) ||
    null
  if (pago) return registrarResultadoPago(pago.id, dataId, estado)

  // 2. Cobro de un débito automático: hereda el external_reference de la suscripción
  const preapprovalId = (crudo.metadata?.preapproval_id
    ?? crudo.point_of_interaction?.transaction_data?.subscription_id) as string | undefined
  const suscripcion = await buscarSuscripcion(referencia, preapprovalId)
  if (suscripcion) {
    return registrarCobroSuscripcion(suscripcion, dataId, estado, mpPayment.transaction_amount ?? suscripcion.monto)
  }

  // 3. Pago que no nació en la web (por ejemplo un link mpago.la viejo)
  console.warn(`[Webhook MP] Pago ${dataId} sin registro local (ref: ${referencia ?? '—'})`)
}

async function procesarSuscripcion(dataId: string): Promise<void> {
  const preapproval = await new PreApproval(mp).get({ id: dataId })
  const suscripcion = await buscarSuscripcion(preapproval.external_reference, preapproval.id ?? dataId)
  if (!suscripcion) {
    console.warn(`[Webhook MP] Suscripción ${dataId} sin registro local`)
    return
  }
  await actualizarEstadoSuscripcion(suscripcion, {
    preapprovalId: preapproval.id ?? dataId,
    estado: preapproval.status ?? 'unknown',
    proximoCobro: preapproval.next_payment_date,
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const url = new URL(request.url)

    const tipo = body.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic')
    // MP firma el data.id que manda en la query (en minúsculas si es alfanumérico).
    const dataId = String(url.searchParams.get('data.id') ?? body.data?.id ?? '')

    const atendido = tipo === 'payment' || tipo === 'subscription_preapproval'
    if (!atendido || !dataId) return NextResponse.json({ ok: true })

    const secret = process.env.MP_WEBHOOK_SECRET
    if (secret) {
      if (!firmaValida(request, dataId.toLowerCase(), secret)) {
        console.warn('[Webhook MP] Firma inválida o ausente')
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
      }
    } else {
      // Sin secreto no se puede validar la firma. El estado igual se consulta
      // a la API de MP con nuestro token, así que no se confía en el body.
      console.error('[Webhook MP] MP_WEBHOOK_SECRET no configurado')
    }

    if (tipo === 'payment') await procesarPago(dataId)
    else await procesarSuscripcion(dataId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Webhook MP]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
