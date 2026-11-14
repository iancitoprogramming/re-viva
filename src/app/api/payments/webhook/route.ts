// POST /api/payments/webhook
// Recibe notificaciones asíncronas de Mercado Pago.
// Sin auth JWT: valida la firma con MP_WEBHOOK_SECRET. Nunca confía en el body:
// con el id que llega, consulta el estado real a la API de MP con nuestro token.
// Si algo falla de nuestro lado responde 500 para que MP reintente.
//
// Eventos que atiende (hay que tildarlos en el panel de MP, Tus integraciones → Webhooks):
//   · payment                          → "Pagos": checkout y cobros de suscripciones
//   · subscription_preapproval         → "Planes y suscripciones": alta, pausa o baja
//   · subscription_authorized_payment  → "Planes y suscripciones": cada cobro mensual

import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { registrarResultadoPago } from '@/lib/pagos'
import { firmaValida } from '@/lib/mpWebhook'
import { actualizarEstadoSuscripcion, buscarSuscripcion, registrarCobroSuscripcion } from '@/lib/suscripciones'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

const EVENTOS = new Set(['payment', 'subscription_preapproval', 'subscription_authorized_payment'])

// Un id que MP no conoce (por ejemplo la notificación de prueba del panel)
// no tiene arreglo: se responde 200 para que no reintente.
class NoEncontrado extends Error {}
const es404 = (error: unknown) => (error as { status?: number })?.status === 404

async function procesarPago(dataId: string): Promise<void> {
  const mpPayment = await new Payment(mp).get({ id: dataId }).catch(e => {
    throw es404(e) ? new NoEncontrado(`Pago ${dataId}`) : e
  })
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
  if (pago) return registrarResultadoPago(pago.id, String(mpPayment.id ?? dataId), estado)

  // 2. Cobro de un débito automático. Si el pago no trae cómo encontrar la
  //    suscripción, igual lo registra el evento subscription_authorized_payment.
  const preapprovalId = (crudo.metadata?.preapproval_id
    ?? crudo.point_of_interaction?.transaction_data?.subscription_id) as string | undefined
  const suscripcion = await buscarSuscripcion(referencia, preapprovalId)
  if (suscripcion) {
    return registrarCobroSuscripcion(suscripcion, String(mpPayment.id ?? dataId), estado, mpPayment.transaction_amount ?? suscripcion.monto)
  }

  // 3. Pago que no nació en la web (por ejemplo un link mpago.la viejo)
  console.warn(`[Webhook MP] Pago ${dataId} sin registro local (ref: ${referencia ?? '—'})`)
}

async function procesarSuscripcion(dataId: string): Promise<void> {
  const preapproval = await new PreApproval(mp).get({ id: dataId }).catch(e => {
    throw es404(e) ? new NoEncontrado(`Suscripción ${dataId}`) : e
  })
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

// Cobro mensual de un débito automático. El SDK no trae este recurso.
async function procesarCobroSuscripcion(dataId: string): Promise<void> {
  const res = await fetch(`https://api.mercadopago.com/authorized_payments/${encodeURIComponent(dataId)}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    cache: 'no-store',
  })
  if (res.status === 404) throw new NoEncontrado(`Cobro de suscripción ${dataId}`)
  if (!res.ok) throw new Error(`authorized_payments/${dataId} respondió ${res.status}`)

  const cobro = await res.json() as {
    preapproval_id?: string
    external_reference?: string
    transaction_amount?: number
    payment?: { id?: number | string }
  }
  // Cobro programado que todavía no se intentó: no hay pago que registrar.
  if (!cobro.payment?.id) return

  const suscripcion = await buscarSuscripcion(cobro.external_reference, cobro.preapproval_id)
  if (!suscripcion) {
    console.warn(`[Webhook MP] Cobro ${dataId} de una suscripción sin registro local (${cobro.preapproval_id ?? '—'})`)
    return
  }

  // El estado se toma del pago, que es la fuente de verdad.
  const mpPayment = await new Payment(mp).get({ id: String(cobro.payment.id) })
  await registrarCobroSuscripcion(
    suscripcion,
    String(cobro.payment.id),
    mpPayment.status ?? 'unknown',
    mpPayment.transaction_amount ?? cobro.transaction_amount ?? suscripcion.monto,
  )
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const url = new URL(request.url)

    const tipo = body.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic')
    // MP firma el data.id que manda en la query.
    const dataId = String(url.searchParams.get('data.id') ?? body.data?.id ?? '')

    // Avisos que no atendemos (o IPN viejos, que no traen data.id): 200 y listo.
    if (!EVENTOS.has(tipo) || !dataId) return NextResponse.json({ ok: true })

    const secret = process.env.MP_WEBHOOK_SECRET
    if (secret) {
      const ok = firmaValida({
        xSignature: request.headers.get('x-signature'),
        xRequestId: request.headers.get('x-request-id'),
        dataId,
        secret,
      })
      if (!ok) {
        console.warn(`[Webhook MP] Firma inválida (${tipo} ${dataId})`)
        return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
      }
    } else {
      // Sin secreto no se puede validar la firma. El estado igual se consulta
      // a la API de MP con nuestro token, así que no se confía en el body.
      console.error('[Webhook MP] MP_WEBHOOK_SECRET no configurado')
    }

    if (tipo === 'payment') await procesarPago(dataId)
    else if (tipo === 'subscription_preapproval') await procesarSuscripcion(dataId)
    else await procesarCobroSuscripcion(dataId)

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof NoEncontrado) {
      console.warn(`[Webhook MP] ${error.message} no existe en MP (¿notificación de prueba?)`)
      return NextResponse.json({ ok: true })
    }
    console.error('[Webhook MP]', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
