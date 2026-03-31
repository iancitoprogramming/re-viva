import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'
import { enviarEmailActivacion } from '@/lib/email'
import { PLAN_DURACIONES_DIAS } from '@/lib/constants'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  const { id } = await params
  const { clasificacion, calorias, proteina, hidratos, grasas, notasTrainer, tipoPlan } = await request.json()

  if (!clasificacion || !calorias || !proteina || !hidratos || !grasas) {
    return NextResponse.json({ error: 'Todos los campos del plan son obligatorios.' }, { status: 400 })
  }

  // Calcular fecha de vencimiento según el tipo de plan
  const ahora = new Date()
  let fechaVencimiento: Date | null = null
  if (tipoPlan) {
    const dias = PLAN_DURACIONES_DIAS[tipoPlan] ?? 30
    fechaVencimiento = new Date(ahora.getTime() + dias * 24 * 60 * 60 * 1000)
  }

  await prisma.nutritionalPlan.upsert({
    where:  { userId: id },
    update: {
      estado:           'ACTIVO',
      clasificacion,
      calorias:         Number(calorias),
      proteina:         Number(proteina),
      hidratos:         Number(hidratos),
      grasas:           Number(grasas),
      notasTrainer:     notasTrainer || null,
      activadoEn:       ahora,
      tipoPlan:         tipoPlan || null,
      fechaVencimiento: fechaVencimiento,
    },
    create: {
      userId:           id,
      estado:           'ACTIVO',
      clasificacion,
      calorias:         Number(calorias),
      proteina:         Number(proteina),
      hidratos:         Number(hidratos),
      grasas:           Number(grasas),
      notasTrainer:     notasTrainer || null,
      activadoEn:       ahora,
      tipoPlan:         tipoPlan || null,
      fechaVencimiento: fechaVencimiento,
    },
  })

  // Notificar al cliente — async, no bloquea
  const usuario = await prisma.user.findUnique({ where: { id }, select: { nombre: true, email: true } })
  if (usuario) {
    enviarEmailActivacion(
      usuario.nombre,
      usuario.email,
      clasificacion,
      Number(calorias),
      Number(proteina),
      Number(hidratos),
      Number(grasas),
      notasTrainer || null
    ).catch(e => console.error('[ACTIVAR-PLAN] Error email:', e.message))
  }

  return NextResponse.json({ ok: true })
}
