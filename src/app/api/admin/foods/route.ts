// GET  /api/admin/foods          — lista todos los alimentos activos
// POST /api/admin/foods          — crea un alimento nuevo

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

export async function GET(request: Request) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const foods = await prisma.food.findMany({
    orderBy: [{ categoria: 'asc' }, { nombre: 'asc' }],
  })
  return NextResponse.json({ foods })
}

export async function POST(request: Request) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const body = await request.json()
  const { nombre, categoria, unidad, kcal, proteina, hidratos, grasas, unidadCompra, notas } = body

  if (!nombre || !categoria || kcal == null || proteina == null || hidratos == null || grasas == null) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
  }

  const food = await prisma.food.create({
    data: {
      nombre,
      categoria,
      unidad: unidad || 'g',
      kcal: Number(kcal),
      proteina: Number(proteina),
      hidratos: Number(hidratos),
      grasas: Number(grasas),
      unidadCompra: unidadCompra || null,
      notas: notas || null,
    },
  })

  return NextResponse.json({ food }, { status: 201 })
}
