// GET  /api/admin/templates       — lista templates (con filtro opcional por objetivo/genero)
// POST /api/admin/templates       — crea template nuevo con sus comidas e items

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

  const { searchParams } = new URL(request.url)
  const objetivo = searchParams.get('objetivo')
  const genero = searchParams.get('genero')

  const templates = await prisma.mealPlanTemplate.findMany({
    where: {
      activo: true,
      ...(objetivo && { objetivo: objetivo as never }),
      ...(genero && { genero: genero as never }),
    },
    include: {
      comidas: {
        orderBy: { orden: 'asc' },
        include: {
          items: {
            include: { food: true },
          },
        },
      },
    },
    orderBy: { creadoEn: 'desc' },
  })
  return NextResponse.json({ templates })
}

export async function POST(request: Request) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const body = await request.json()
  const {
    nombre, descripcion, genero, objetivo, edadMin, edadMax, adherencia,
    kcalTarget, proteinaTarget, hidratosTarget, grasasTarget, notas,
    generadoConIA, comidas,
  } = body

  if (!nombre || kcalTarget == null || proteinaTarget == null || hidratosTarget == null || grasasTarget == null) {
    return NextResponse.json({ error: 'Faltan campos obligatorios.' }, { status: 400 })
  }

  const template = await prisma.mealPlanTemplate.create({
    data: {
      nombre,
      descripcion: descripcion || null,
      genero: genero || null,
      objetivo: objetivo || null,
      edadMin: edadMin ? Number(edadMin) : null,
      edadMax: edadMax ? Number(edadMax) : null,
      adherencia: adherencia || null,
      kcalTarget: Number(kcalTarget),
      proteinaTarget: Number(proteinaTarget),
      hidratosTarget: Number(hidratosTarget),
      grasasTarget: Number(grasasTarget),
      notas: notas || null,
      generadoConIA: generadoConIA || false,
      comidas: {
        create: (comidas || []).map((c: { nombre: string; orden: number; horaSugerida?: string; items: { foodId: string; gramos: number; notas?: string }[] }, i: number) => ({
          nombre: c.nombre,
          orden: c.orden ?? i,
          horaSugerida: c.horaSugerida || null,
          items: {
            create: (c.items || []).map((it: { foodId: string; gramos: number; notas?: string }) => ({
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

  return NextResponse.json({ template }, { status: 201 })
}
