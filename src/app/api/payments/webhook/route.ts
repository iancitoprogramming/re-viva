// POST /api/payments/webhook
// Recibe notificaciones asíncronas de Mercado Pago.
// Sin auth JWT — valida la firma del webhook con MP_WEBHOOK_SECRET.
// Siempre responde 200 para evitar reintentos de MP.

import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { prisma } from '@/lib/prisma'
import { createHmac } from 'crypto'
import { ES_EBOOK } from '@/lib/constants'
import { enviarNotificacionPagoAprobado } from '@/lib/email'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar firma del webhook si MP_WEBHOOK_SECRET está configurado
    const xSignature = request.headers.get('x-signature')
    const xRequestId = request.headers.get('x-request-id')

    if (process.env.MP_WEBHOOK_SECRET && xSignature && xRequestId) {
      const parts = xSignature.split(',')
      const ts  = parts.find(p => p.startsWith('ts='))?.split('=')[1]
      const v1  = parts.find(p => p.startsWith('v1='))?.split('=')[1]

      if (ts && v1) {
        const manifest = `id:${body.data?.id};request-id:${xRequestId};ts:${ts};`
        const hmac = createHmac('sha256', process.env.MP_WEBHOOK_SECRET)
          .update(manifest)
          .digest('hex')

        if (hmac !== v1) {
          console.warn('[Webhook MP] Firma inválida')
          return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
        }
      }
    }

    // Solo procesar notificaciones de tipo "payment"
    if (body.type !== 'payment') {
      return NextResponse.json({ ok: true })
    }

    const paymentId = body.data?.id
    if (!paymentId) return NextResponse.json({ ok: true })

    // Consultar el estado del pago a la API de MP
    const paymentApi = new Payment(mp)
    const mpPayment = await paymentApi.get({ id: String(paymentId) })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const preferenceId = (mpPayment as any).preference_id as string | undefined
    const status = mpPayment.status

    // Actualizar el registro en la DB
    if (preferenceId) {
      const dbPayment = await prisma.payment.findFirst({
        where: { preferenceId },
        include: { user: true },
      })

      if (dbPayment) {
        await prisma.payment.update({
          where: { id: dbPayment.id },
          data: {
            paymentId: String(paymentId),
            status: status ?? 'unknown',
          },
        })

        // Si el pago fue aprobado y el plan es un ebook, crear entrega pendiente
        if (status === 'approved' && ES_EBOOK.has(dbPayment.planTipo)) {
          await prisma.ebookEntrega.upsert({
            where: { paymentId: dbPayment.id },
            create: {
              userId: dbPayment.userId,
              paymentId: dbPayment.id,
              planTipo: dbPayment.planTipo,
            },
            update: {}, // si ya existe, no tocamos nada
          })
        }

        // Notificar al trainer si el pago fue aprobado
        if (status === 'approved') {
          void enviarNotificacionPagoAprobado(
            dbPayment.user.nombre,
            dbPayment.user.email,
            dbPayment.planTipo,
            dbPayment.amount,
          )
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Webhook MP]', error)
    // Siempre 200 para que MP no reintente
    return NextResponse.json({ ok: true })
  }
}
