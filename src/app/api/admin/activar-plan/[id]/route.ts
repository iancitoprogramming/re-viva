import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  const { id } = await params
  const { clasificacion, calorias, proteina, hidratos, grasas, notasTrainer } = await request.json()

  if (!clasificacion || !calorias || !proteina || !hidratos || !grasas) {
    return NextResponse.json({ error: 'Todos los campos del plan son obligatorios.' }, { status: 400 })
  }

  // Upsert: actualiza si existe, crea si no existe
  await prisma.nutritionalPlan.upsert({
    where:  { userId: id },
    update: {
      estado: 'ACTIVO',
      clasificacion,
      calorias:     Number(calorias),
      proteina:     Number(proteina),
      hidratos:     Number(hidratos),
      grasas:       Number(grasas),
      notasTrainer: notasTrainer || null,
      activadoEn:   new Date(),
    },
    create: {
      userId: id,
      estado: 'ACTIVO',
      clasificacion,
      calorias:     Number(calorias),
      proteina:     Number(proteina),
      hidratos:     Number(hidratos),
      grasas:       Number(grasas),
      notasTrainer: notasTrainer || null,
      activadoEn:   new Date(),
    },
  })

  return NextResponse.json({ ok: true })
}
