// POST  /api/admin/meal-plans/[id]/shopping-list
//   Genera (o regenera) la lista de compras del plan.
//   Agrupa todos los PlanMealItems por alimento, multiplica por diasCubiertos,
//   convierte a unidad de compra (g→kg si ≥1000g, ml→l si ≥1000ml).
//
// GET   /api/admin/meal-plans/[id]/shopping-list
//   Devuelve la lista ya generada.
//
// PATCH /api/admin/meal-plans/[id]/shopping-list
//   Actualiza un item (ej: marcar comprado, ajustar cantidad).

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'
import type { FoodCategoria } from '@prisma/client'

function adminGuard(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return null
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) return null
  return payload
}

// Convierte gramos/ml a unidad de compra legible
function convertirUnidad(totalGramos: number, unidadBase: string, unidadCompra: string | null) {
  if (unidadCompra === 'kg' || (unidadBase === 'g' && totalGramos >= 500)) {
    return { cantidad: Math.round((totalGramos / 1000) * 10) / 10, unidad: 'kg' }
  }
  if (unidadCompra === 'litro' || (unidadBase === 'ml' && totalGramos >= 500)) {
    return { cantidad: Math.round((totalGramos / 1000) * 10) / 10, unidad: 'litro' }
  }
  return { cantidad: Math.round(totalGramos), unidad: unidadBase }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  const lista = await prisma.shoppingList.findUnique({
    where: { mealPlanId: id },
    include: { items: { orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }] } },
  })
  if (!lista) return NextResponse.json({ error: 'Lista no generada aún.' }, { status: 404 })
  return NextResponse.json({ lista })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const diasCubiertos = Number(body.diasCubiertos ?? 7)

  // Cargar el plan completo con foods
  const plan = await prisma.mealPlan.findUnique({
    where: { id },
    include: {
      comidas: {
        include: {
          items: { include: { food: true } },
        },
      },
    },
  })
  if (!plan) return NextResponse.json({ error: 'Plan no encontrado.' }, { status: 404 })

  // Agrupar por alimento
  const totalesPorFood = new Map<string, {
    nombre: string
    categoria: FoodCategoria
    unidadBase: string
    unidadCompra: string | null
    totalGramos: number
  }>()

  for (const comida of plan.comidas) {
    for (const item of comida.items) {
      const existente = totalesPorFood.get(item.foodId)
      if (existente) {
        existente.totalGramos += item.gramos
      } else {
        totalesPorFood.set(item.foodId, {
          nombre: item.food.nombre,
          categoria: item.food.categoria,
          unidadBase: item.food.unidad,
          unidadCompra: item.food.unidadCompra,
          totalGramos: item.gramos,
        })
      }
    }
  }

  // Multiplicar por diasCubiertos (el plan es 1 día)
  const items = Array.from(totalesPorFood.values()).map(f => {
    const { cantidad, unidad } = convertirUnidad(
      f.totalGramos * diasCubiertos,
      f.unidadBase,
      f.unidadCompra,
    )
    return {
      nombre: f.nombre,
      categoria: f.categoria,
      cantidad,
      unidad,
      comprado: false,
    }
  })

  // Eliminar lista anterior si existe y crear la nueva
  await prisma.shoppingList.deleteMany({ where: { mealPlanId: id } })

  const lista = await prisma.shoppingList.create({
    data: {
      mealPlanId: id,
      diasCubiertos,
      items: { create: items },
    },
    include: { items: { orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }] } },
  })

  return NextResponse.json({ lista }, { status: 201 })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  // body: { itemId, comprado?, cantidad?, notas? }
  const { itemId, ...data } = body

  if (!itemId) return NextResponse.json({ error: 'itemId requerido.' }, { status: 400 })

  const lista = await prisma.shoppingList.findUnique({ where: { mealPlanId: id } })
  if (!lista) return NextResponse.json({ error: 'Lista no encontrada.' }, { status: 404 })

  const item = await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: {
      ...(data.comprado !== undefined && { comprado: data.comprado }),
      ...(data.cantidad !== undefined && { cantidad: Number(data.cantidad) }),
    },
  })
  return NextResponse.json({ item })
}
