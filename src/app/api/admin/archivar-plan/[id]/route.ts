// POST /api/admin/archivar-plan/[id] → { archivar: boolean }
// [id] es el id del cliente. Archivar saca al cliente de los activos sin
// borrarlo: deja de recibir avisos y de contar como cliente vigente.
// Desarchivar lo devuelve a ACTIVO.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminDeRequest } from '@/lib/auth'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  const { archivar } = await request.json().catch(() => ({})) as { archivar?: boolean }

  const plan = await prisma.nutritionalPlan.findUnique({ where: { userId: id } })
  if (!plan) return NextResponse.json({ error: 'Ese cliente no tiene plan.' }, { status: 404 })

  if (archivar === false) {
    if (plan.estado !== 'ARCHIVADO') return NextResponse.json({ error: 'El plan no está archivado.' }, { status: 400 })
    await prisma.nutritionalPlan.update({ where: { id: plan.id }, data: { estado: 'ACTIVO' } })
    return NextResponse.json({ ok: true, estado: 'ACTIVO' })
  }

  if (plan.estado !== 'ACTIVO') {
    return NextResponse.json({ error: 'Solo se archivan planes activos.' }, { status: 400 })
  }
  await prisma.nutritionalPlan.update({ where: { id: plan.id }, data: { estado: 'ARCHIVADO' } })
  return NextResponse.json({ ok: true, estado: 'ARCHIVADO' })
}
