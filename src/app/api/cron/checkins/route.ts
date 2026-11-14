// Cron: recordatorio de check-in semanal. Corre los lunes.
// Avisa a los clientes con seguimiento (plan activo, vigente y que no sea
// On Demand) que no registraron ningún check-in en los últimos 7 días.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarRecordatorioCheckin } from '@/lib/email'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[CRON] CRON_SECRET no configurado — endpoint deshabilitado.')
    return NextResponse.json({ error: 'Cron no configurado.' }, { status: 503 })
  }
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ahora = new Date()
  const hace7 = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Sin tipo de plan o sin vencimiento no se sabe si sigue siendo cliente: no se le escribe.
  const planes = await prisma.nutritionalPlan.findMany({
    where: {
      estado: 'ACTIVO',
      tipoPlan: { notIn: ['on-demand'], not: null },
      fechaVencimiento: { gt: ahora },
      activadoEn: { lt: hace7 }, // la primera semana todavía no hay nada que reportar
      user: { deletedAt: null, checkIns: { none: { fecha: { gte: hace7 } } } },
    },
    include: { user: { select: { nombre: true, email: true } } },
  })

  console.log(`[CRON-CHECKINS] ${planes.length} clientes sin check-in en 7 días`)

  for (const plan of planes) {
    await enviarRecordatorioCheckin(plan.user.nombre, plan.user.email)
  }

  return NextResponse.json({ ok: true, enviados: planes.length })
}
