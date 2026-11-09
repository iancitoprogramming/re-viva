// GET    /api/admin/compras/[userId]            → cliente + todas sus listas semanales
// PUT    /api/admin/compras/[userId]            → guarda una semana { semana, texto, notas } (reemplaza items)
// DELETE /api/admin/compras/[userId]?semana=N   → borra esa semana

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminDeRequest } from '@/lib/auth'
import { parsearListaTexto } from '@/lib/compras'

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { userId } = await params

  const cliente = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, nombre: true, email: true,
      perfil: { select: { supermercado: true, comeAfuera: true, sesionesCocina: true } },
      shoppingLists: { orderBy: { semana: 'asc' }, include: { items: { orderBy: { nombre: 'asc' } } } },
    },
  })
  if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 })
  return NextResponse.json(cliente)
}

export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { userId } = await params
  const body = await request.json().catch(() => ({}))

  const semana = Number(body.semana)
  if (!Number.isInteger(semana) || semana < 1 || semana > 52) {
    return NextResponse.json({ error: 'Semana inválida.' }, { status: 400 })
  }
  const { items, errores } = parsearListaTexto(String(body.texto ?? ''))
  if (errores.length) {
    return NextResponse.json({ error: 'Hay líneas que no se pudieron leer.', errores }, { status: 400 })
  }
  if (!items.length) return NextResponse.json({ error: 'La lista está vacía.' }, { status: 400 })

  const notas = typeof body.notas === 'string' && body.notas.trim() ? body.notas.trim() : null

  const lista = await prisma.$transaction(async tx => {
    const l = await tx.shoppingList.upsert({
      where: { userId_semana: { userId, semana } },
      create: { userId, semana, notas },
      update: { notas },
    })
    await tx.shoppingListItem.deleteMany({ where: { shoppingListId: l.id } })
    await tx.shoppingListItem.createMany({ data: items.map(i => ({ ...i, shoppingListId: l.id })) })
    return l
  })

  return NextResponse.json({ ok: true, listaId: lista.id, items: items.length })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { userId } = await params
  const semana = Number(new URL(request.url).searchParams.get('semana'))
  await prisma.shoppingList.deleteMany({ where: { userId, semana } })
  return NextResponse.json({ ok: true })
}
