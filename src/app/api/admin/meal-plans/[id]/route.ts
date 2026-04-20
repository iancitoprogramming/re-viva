// GET    /api/admin/meal-plans/[id]  — detalle completo del plan
// PATCH  /api/admin/meal-plans/[id]  — actualiza estado (BORRADOR→ACTIVO→ARCHIVADO) y/o notas
// DELETE /api/admin/meal-plans/[id]  — elimina un borrador (no se puede borrar un ACTIVO)

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

function adminGuard(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return null
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) return null
  return payload
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  const plan = await prisma.mealPlan.findUnique({
    where: { id },
    include: {
      comidas: {
        orderBy: { orden: 'asc' },
        include: { items: { include: { food: true } } },
      },
      shoppingList: { include: { items: { orderBy: { categoria: 'asc' } } } },
    },
  })
  if (!plan) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })
  return NextResponse.json({ plan })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  const body = await request.json()

  const plan = await prisma.mealPlan.findUnique({ where: { id } })
  if (!plan) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })

  // Si se activa este plan, archivar el activo anterior del mismo usuario
  if (body.estado === 'ACTIVO' && plan.estado !== 'ACTIVO') {
    await prisma.mealPlan.updateMany({
      where: { userId: plan.userId, estado: 'ACTIVO', NOT: { id } },
      data: { estado: 'ARCHIVADO' },
    })
  }

  const updated = await prisma.mealPlan.update({
    where: { id },
    data: {
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.notas !== undefined && { notas: body.notas }),
    },
    include: {
      comidas: { include: { items: { include: { food: true } } } },
      shoppingList: { include: { items: true } },
    },
  })
  return NextResponse.json({ plan: updated })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  const plan = await prisma.mealPlan.findUnique({ where: { id } })
  if (!plan) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })
  if (plan.estado === 'ACTIVO') {
    return NextResponse.json({ error: 'No se puede eliminar un plan activo.' }, { status: 400 })
  }
  await prisma.mealPlan.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
