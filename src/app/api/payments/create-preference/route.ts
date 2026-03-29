// POST /api/payments/create-preference
// Crea una preferencia de pago en Mercado Pago y la guarda en la DB.
// Requiere sesión JWT válida.

import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANES_MP, type PlanMPKey } from '@/lib/constants'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

export async function POST(request: Request) {
  // Guard: verificar que MP_ACCESS_TOKEN esté configurado
  if (!process.env.MP_ACCESS_TOKEN) {
    console.error('[create-preference] MP_ACCESS_TOKEN no está configurado')
    return NextResponse.json({ error: 'Configuración de pagos incompleta' }, { status: 500 })
  }

  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  try {
    const { planTipo } = await request.json() as { planTipo: string }
    const plan = PLANES_MP[planTipo as PlanMPKey]
    if (!plan) return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://re-viva.vercel.app'

    const preference = new Preference(mp)
    const result = await preference.create({
      body: {
        items: [{
          id: planTipo,
          title: plan.titulo,
          description: plan.descripcion,
          quantity: 1,
          unit_price: plan.monto,
          currency_id: 'ARS',
        }],
        payer: {
          name: payload.nombre,
          email: payload.email,
        },
        back_urls: {
          success: `${baseUrl}/checkout/success`,
          failure: `${baseUrl}/checkout/failure`,
          pending: `${baseUrl}/checkout/pending`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/payments/webhook`,
        external_reference: payload.userId,
        metadata: {
          userId: payload.userId,
          planTipo,
        },
      },
    })

    // Guardar la preferencia en la DB
    await prisma.payment.create({
      data: {
        userId: payload.userId,
        planTipo,
        preferenceId: result.id!,
        amount: plan.monto,
      },
    })

    return NextResponse.json({ preferenceId: result.id })
  } catch (error: unknown) {
    const e = error as { message?: string; cause?: unknown; status?: number }
    console.error('[create-preference] Error:', e?.message, JSON.stringify(e?.cause ?? error))
    return NextResponse.json({ error: 'Error al crear la preferencia de pago' }, { status: 500 })
  }
}
