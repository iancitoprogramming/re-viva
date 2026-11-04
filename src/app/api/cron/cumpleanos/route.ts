// Cron: enviar emails de cumpleaños — ejecuta diariamente a las 12 UTC (9 AM BA)
// Configurado en vercel.json. Protegido con CRON_SECRET.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarFelicitacionCumpleanos } from '@/lib/email'

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

  const hoy = new Date()
  const mes = hoy.getMonth() + 1
  const dia = hoy.getDate()

  // Traer todos los perfiles con fecha de nacimiento
  const perfiles = await prisma.nutritionalProfile.findMany({
    where: { fechaNacimiento: { not: null } },
    include: { user: { select: { nombre: true, email: true } } },
  })

  // Filtrar los que cumplen hoy (comparar mes y día)
  const cumpleanheros = perfiles.filter(p => {
    if (!p.fechaNacimiento) return false
    const fn = new Date(p.fechaNacimiento)
    return fn.getMonth() + 1 === mes && fn.getDate() === dia
  })

  console.log(`[CRON-CUMPLEANOS] ${dia}/${mes} — ${cumpleanheros.length} cumpleaños hoy`)

  for (const p of cumpleanheros) {
    await enviarFelicitacionCumpleanos(p.user.nombre, p.user.email)
  }

  return NextResponse.json({ ok: true, enviados: cumpleanheros.length })
}
