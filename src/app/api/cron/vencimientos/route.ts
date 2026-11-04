// Cron: recordatorios de vencimiento de plan — ejecuta diariamente
// Avisa a clientes cuyo plan vence en exactamente 7 días.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarRecordatorioVencimiento } from '@/lib/email'

export async function GET(request: Request) {
  // Sin CRON_SECRET el endpoint queda público: cualquiera podría disparar el
  // envío masivo de emails. Preferimos que no corra antes que corra abierto.
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET no configurado — endpoint deshabilitado.')
    return NextResponse.json({ error: 'Cron no configurado.' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ahora  = new Date()
  // Ventana: planes que vencen entre hoy y los próximos 7 días
  const en7    = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000)
  // Límite inferior: no enviar si queda menos de 6 días (ya fue notificado)
  const en6    = new Date(ahora.getTime() + 6 * 24 * 60 * 60 * 1000)

  const planes = await prisma.nutritionalPlan.findMany({
    where: {
      estado:          'ACTIVO',
      fechaVencimiento: { gt: en6, lte: en7 },
    },
    include: { user: { select: { nombre: true, email: true } } },
  })

  console.log(`[CRON-VENCIMIENTOS] ${planes.length} planes próximos a vencer`)

  for (const plan of planes) {
    await enviarRecordatorioVencimiento(
      plan.user.nombre,
      plan.user.email,
      plan.fechaVencimiento!
    )
  }

  return NextResponse.json({ ok: true, enviados: planes.length })
}
