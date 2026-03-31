// Cron: recordatorios de vencimiento de plan — ejecuta diariamente
// Avisa a clientes cuyo plan vence en exactamente 7 días.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarRecordatorioVencimiento } from '@/lib/email'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
