// Débito automático (preapproval de Mercado Pago). Requiere sesión.
//   GET    → la suscripción vigente del usuario, o null
//   POST   → { planTipo, payerEmail } crea la suscripción y devuelve initPoint
//   DELETE → cancela la suscripción vigente

import { NextResponse } from 'next/server'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLANES_MP } from '@/lib/constants'
import { esPlanSuscribible, mesesPorCobro } from '@/lib/periodoSuscripcion'

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
})

function sesion(request: Request) {
  const token = obtenerTokenDeRequest(request)
  return token ? verificarToken(token) : null
}

const vigente = (userId: string) => prisma.suscripcion.findFirst({
  where: { userId, estado: { in: ['authorized', 'paused'] } },
  orderBy: { creadoEn: 'desc' },
})

export async function GET(request: Request) {
  const payload = sesion(request)
  if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const s = await vigente(payload.userId)
  return NextResponse.json({
    suscripcion: s && {
      planTipo: s.planTipo, monto: s.monto, estado: s.estado,
      proximoCobro: s.proximoCobro, ultimoCobroEn: s.ultimoCobroEn,
    },
  })
}

export async function POST(request: Request) {
  const payload = sesion(request)
  if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!process.env.MP_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'Configuración de pagos incompleta' }, { status: 500 })
  }

  const { planTipo, payerEmail } = await request.json().catch(() => ({})) as { planTipo?: string; payerEmail?: string }
  if (!planTipo || !esPlanSuscribible(planTipo)) {
    return NextResponse.json({ error: 'Ese plan no tiene débito automático.' }, { status: 400 })
  }
  const email = (payerEmail ?? payload.email).trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Revisá el mail de tu cuenta de Mercado Pago.' }, { status: 400 })
  }
  if (await vigente(payload.userId)) {
    return NextResponse.json({ error: 'Ya tenés un débito automático activo.' }, { status: 409 })
  }

  const plan = PLANES_MP[planTipo]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://re-viva.vercel.app'

  const suscripcion = await prisma.suscripcion.create({
    data: { userId: payload.userId, planTipo, monto: plan.monto, payerEmail: email },
  })

  try {
    const resultado = await new PreApproval(mp).create({
      body: {
        reason: plan.titulo,
        external_reference: suscripcion.id,
        payer_email: email,
        back_url: `${baseUrl}/checkout/success?plan=${planTipo}&suscripcion=1`,
        status: 'pending',
        auto_recurring: {
          frequency: mesesPorCobro(planTipo),
          frequency_type: 'months',
          transaction_amount: plan.monto,
          currency_id: 'ARS',
        },
      },
    })
    if (!resultado.id || !resultado.init_point) throw new Error('Mercado Pago no devolvió el link de la suscripción')

    await prisma.suscripcion.update({ where: { id: suscripcion.id }, data: { preapprovalId: resultado.id } })
    return NextResponse.json({ initPoint: resultado.init_point })
  } catch (error) {
    // Sin link no hay nada que el cliente pueda autorizar: no se deja el registro huérfano.
    await prisma.suscripcion.delete({ where: { id: suscripcion.id } }).catch(() => null)
    console.error('[suscripcion] Error al crear en MP:', (error as Error)?.message, JSON.stringify((error as { cause?: unknown })?.cause ?? null))
    return NextResponse.json({ error: 'No se pudo iniciar el débito automático.' }, { status: 502 })
  }
}

export async function DELETE(request: Request) {
  const payload = sesion(request)
  if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const s = await vigente(payload.userId)
  if (!s?.preapprovalId) return NextResponse.json({ error: 'No tenés un débito automático activo.' }, { status: 404 })

  try {
    await new PreApproval(mp).update({ id: s.preapprovalId, body: { status: 'cancelled' } })
  } catch (error) {
    console.error('[suscripcion] Error al cancelar en MP:', (error as Error)?.message)
    return NextResponse.json({ error: 'No se pudo cancelar. Probá de nuevo o escribinos.' }, { status: 502 })
  }

  // El estado local lo termina de asentar el webhook (y avisa al trainer).
  return NextResponse.json({ ok: true })
}
