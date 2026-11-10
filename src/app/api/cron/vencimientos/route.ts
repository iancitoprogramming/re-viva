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

  // Dos avisos: a 7 días y el día anterior. Cada ventana dura 24 h, así el
  // cron diario agarra cada plan una sola vez por aviso.
  const DIA = 24 * 60 * 60 * 1000
  const ahora = Date.now()
  const ventana = (dias: number) => ({
    fechaVencimiento: { gt: new Date(ahora + (dias - 1) * DIA), lte: new Date(ahora + dias * DIA) },
  })

  const planes = await prisma.nutritionalPlan.findMany({
    where: { estado: 'ACTIVO', OR: [ventana(7), ventana(1)] },
    include: { user: { select: { nombre: true, email: true } } },
  })

  console.log(`[CRON-VENCIMIENTOS] ${planes.length} planes próximos a vencer`)

  for (const plan of planes) {
    await enviarRecordatorioVencimiento(
      plan.user.nombre,
      plan.user.email,
      plan.fechaVencimiento!,
      plan.tipoPlan,
    )
  }

  return NextResponse.json({ ok: true, enviados: planes.length })
}
