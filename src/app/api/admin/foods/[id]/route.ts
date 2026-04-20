// GET    /api/admin/foods/[id]   — detalle de un alimento
// PATCH  /api/admin/foods/[id]   — actualiza un alimento
// DELETE /api/admin/foods/[id]   — soft delete (activo = false)

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
  const food = await prisma.food.findUnique({ where: { id } })
  if (!food) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })
  return NextResponse.json({ food })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  const body = await request.json()

  const food = await prisma.food.update({
    where: { id },
    data: {
      ...(body.nombre !== undefined && { nombre: body.nombre }),
      ...(body.categoria !== undefined && { categoria: body.categoria }),
      ...(body.unidad !== undefined && { unidad: body.unidad }),
      ...(body.kcal !== undefined && { kcal: Number(body.kcal) }),
      ...(body.proteina !== undefined && { proteina: Number(body.proteina) }),
      ...(body.hidratos !== undefined && { hidratos: Number(body.hidratos) }),
      ...(body.grasas !== undefined && { grasas: Number(body.grasas) }),
      ...(body.unidadCompra !== undefined && { unidadCompra: body.unidadCompra }),
      ...(body.notas !== undefined && { notas: body.notas }),
      ...(body.activo !== undefined && { activo: body.activo }),
    },
  })
  return NextResponse.json({ food })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  // Soft delete: no borramos si tiene items en planes activos
  const enUso = await prisma.planMealItem.count({ where: { foodId: id } })
  if (enUso > 0) {
    await prisma.food.update({ where: { id }, data: { activo: false } })
    return NextResponse.json({ ok: true, softDelete: true })
  }
  await prisma.food.delete({ where: { id } })
  return NextResponse.json({ ok: true, softDelete: false })
}
