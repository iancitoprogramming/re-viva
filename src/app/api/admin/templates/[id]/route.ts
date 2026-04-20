// GET    /api/admin/templates/[id]  — detalle completo
// PUT    /api/admin/templates/[id]  — reemplaza template completo (comidas + items)
// DELETE /api/admin/templates/[id]  — soft delete

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
  const template = await prisma.mealPlanTemplate.findUnique({
    where: { id },
    include: {
      comidas: {
        orderBy: { orden: 'asc' },
        include: { items: { include: { food: true } } },
      },
    },
  })
  if (!template) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 })
  return NextResponse.json({ template })
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  const body = await request.json()
  const {
    nombre, descripcion, genero, objetivo, edadMin, edadMax, adherencia,
    kcalTarget, proteinaTarget, hidratosTarget, grasasTarget, notas,
    generadoConIA, comidas,
  } = body

  // Borrar comidas viejas (cascade borra sus items)
  await prisma.templateMeal.deleteMany({ where: { templateId: id } })

  const template = await prisma.mealPlanTemplate.update({
    where: { id },
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
      generadoConIA: generadoConIA ?? false,
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

  return NextResponse.json({ template })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  await prisma.mealPlanTemplate.update({ where: { id }, data: { activo: false } })
  return NextResponse.json({ ok: true })
}
