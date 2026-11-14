// POST /api/payments/process
// Procesa el pago con los datos enviados por el Payment Brick.
// Requiere sesión JWT válida.

import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANES_MP, type PlanMPKey } from '@/lib/constants'
import { registrarResultadoPago } from '@/lib/pagos'
import { urlNotificacion } from '@/lib/mpWebhook'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  try {
    const { formData, preferenceId } = await request.json() as {
      formData: Record<string, unknown>
      preferenceId: string
    }
    if (!formData || !preferenceId) {
      return NextResponse.json({ error: 'Datos de pago incompletos' }, { status: 400 })
    }

    // El pago se cobra contra el registro que creó create-preference para este
    // usuario. El monto sale de ahí, nunca del browser.
    const pago = await prisma.payment.findFirst({
      where: { preferenceId, userId: payload.userId },
    })
    if (!pago) return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    if (pago.status === 'approved') {
      return NextResponse.json({ status: 'approved', paymentId: pago.paymentId })
    }

    const plan = PLANES_MP[pago.planTipo as PlanMPKey]

    // Del brick se toma solo lo que identifica el medio de pago y al pagador.
    // Monto, descripción y referencias los pone el servidor.
    const { token: cardToken, issuer_id, payment_method_id, installments, payer } = formData

    const paymentApi = new Payment(mp)
    const result = await paymentApi.create({
      body: {
        token: cardToken as string | undefined,
        issuer_id: issuer_id as number | undefined,
        payment_method_id: payment_method_id as string | undefined,
        installments: installments as number | undefined,
        payer: payer as Record<string, never> | undefined,
        transaction_amount: pago.amount,
        description: plan?.titulo ?? pago.planTipo,
        external_reference: pago.id,
        statement_descriptor: 'REVIVA IGZ',
        notification_url: urlNotificacion(),
        metadata: {
          userId: payload.userId,
          planTipo: pago.planTipo,
          paymentDbId: pago.id,
        },
      },
      requestOptions: { idempotencyKey: `${pago.id}-${String(formData.token ?? formData.payment_method_id ?? '')}` },
    })

    await registrarResultadoPago(pago.id, String(result.id), result.status ?? 'unknown')

    return NextResponse.json({
      status: result.status,
      detail: result.status_detail,
      paymentId: result.id,
    })
  } catch (error) {
    console.error('[process-payment]', error)
    return NextResponse.json({ error: 'Error al procesar el pago' }, { status: 500 })
  }
}
