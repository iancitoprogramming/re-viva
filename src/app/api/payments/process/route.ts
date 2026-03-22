// POST /api/payments/process
// Procesa el pago con los datos enviados por el Payment Brick.
// Requiere sesión JWT válida.

import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Payment } from 'mercadopago'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  try {
    const formData = await request.json()

    const paymentApi = new Payment(mp)
    const result = await paymentApi.create({
      body: {
        ...formData,
        metadata: {
          userId: payload.userId,
        },
      },
    })

    // Actualizar el registro en la DB con el resultado
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefId = (result as any).preference_id as string | undefined
    if (prefId) {
      await prisma.payment.updateMany({
        where: {
          preferenceId: prefId,
          userId: payload.userId,
        },
        data: {
          paymentId: String(result.id),
          status: result.status ?? 'unknown',
        },
      })
    }

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
