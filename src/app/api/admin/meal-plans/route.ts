// GET  /api/admin/meal-plans?userId=   — planes de un cliente (historial de versiones)
// POST /api/admin/meal-plans            — crea nuevo plan (nueva versión para el cliente)
//
// Lógica de versionado:
//   Cuando se crea un plan para un cliente que ya tiene uno ACTIVO,
//   el plan anterior pasa a ARCHIVADO y el nuevo arranca como BORRADOR.
//   El trainer puede activarlo explícitamente con PATCH /meal-plans/[id].

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

// Calcula macros totales sumando todos los items del plan
function calcularMacros(comidas: { items: { gramos: number; food: { kcal: number; proteina: number; hidratos: number; grasas: number } }[] }[]) {
  let kcal = 0, proteina = 0, hidratos = 0, grasas = 0
  for (const comida of comidas) {
    for (const item of comida.items) {
      const factor = item.gramos / 100
      kcal      += item.food.kcal      * factor
      proteina  += item.food.proteina  * factor
      hidratos  += item.food.hidratos  * factor
      grasas    += item.food.grasas    * factor
    }
  }
  return {
    kcalTotal:      Math.round(kcal),
    proteinaTotal:  Math.round(proteina * 10) / 10,
    hidratosTotal:  Math.round(hidratos * 10) / 10,
    grasasTotal:    Math.round(grasas   * 10) / 10,
  }
}

export async function GET(request: Request) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId requerido.' }, { status: 400 })

  const plans = await prisma.mealPlan.findMany({
    where: { userId },
    include: {
      comidas: {
        orderBy: { orden: 'asc' },
        include: { items: { include: { food: true } } },
      },
      shoppingList: { include: { items: true } },
    },
    orderBy: { version: 'desc' },
  })
  return NextResponse.json({ plans })
}

export async function POST(request: Request) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const body = await request.json()
  const {
    userId, templateOrigenId, notas,
    kcalTarget, proteinaTarget, hidratosTarget, grasasTarget,
    comidas, // array de { nombre, orden, horaSugerida, items: [{ foodId, gramos, notas }] }
  } = body

  if (!userId || !comidas?.length) {
    return NextResponse.json({ error: 'userId y comidas son obligatorios.' }, { status: 400 })
  }

  // Calcular macros desde los items (necesitamos los foods)
  const foodIds = (comidas as { items: { foodId: string }[] }[]).flatMap(c => c.items.map((it: { foodId: string }) => it.foodId))
  const foods = await prisma.food.findMany({ where: { id: { in: foodIds } } })
  const foodMap = new Map(foods.map(f => [f.id, f]))

  const comidasConFood = (comidas as { nombre: string; orden: number; horaSugerida?: string; items: { foodId: string; gramos: number; notas?: string }[] }[]).map(c => ({
    ...c,
    items: c.items.map(it => ({
      ...it,
      food: foodMap.get(it.foodId)!,
    })),
  }))
  const totales = calcularMacros(comidasConFood)

  // Versionar: archivar plan activo anterior
  const planActivo = await prisma.mealPlan.findFirst({
    where: { userId, estado: 'ACTIVO' },
  })
  if (planActivo) {
    await prisma.mealPlan.update({ where: { id: planActivo.id }, data: { estado: 'ARCHIVADO' } })
  }

  // Calcular próxima versión
  const ultimaVersion = await prisma.mealPlan.findFirst({
    where: { userId },
    orderBy: { version: 'desc' },
    select: { version: true },
  })
  const nuevaVersion = (ultimaVersion?.version ?? 0) + 1

  const plan = await prisma.mealPlan.create({
    data: {
      userId,
      version: nuevaVersion,
      estado: 'BORRADOR',
      templateOrigenId: templateOrigenId || null,
      ...totales,
      kcalTarget:      kcalTarget      ? Number(kcalTarget)      : null,
      proteinaTarget:  proteinaTarget  ? Number(proteinaTarget)  : null,
      hidratosTarget:  hidratosTarget  ? Number(hidratosTarget)  : null,
      grasasTarget:    grasasTarget    ? Number(grasasTarget)    : null,
      notas: notas || null,
      comidas: {
        create: (comidas as { nombre: string; orden: number; horaSugerida?: string; items: { foodId: string; gramos: number; notas?: string }[] }[]).map((c, i) => ({
          nombre: c.nombre,
          orden: c.orden ?? i,
          horaSugerida: c.horaSugerida || null,
          items: {
            create: c.items.map((it: { foodId: string; gramos: number; notas?: string }) => ({
              foodId: it.foodId,
              gramos: Number(it.gramos),
              notas: it.notas || null,
            })),
          },
        })),
      },
    },
    include: {
      comidas: { include: { items: { include: { food: true } } } },
    },
  })

  return NextResponse.json({ plan }, { status: 201 })
}
