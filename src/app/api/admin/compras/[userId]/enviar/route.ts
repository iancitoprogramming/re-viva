// POST /api/admin/compras/[userId]/enviar { semanas: number[] }
// Manda por mail al cliente las listas elegidas (una por mail, en orden) y marca enviadoEn.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminDeRequest } from '@/lib/auth'
import { enviarListaCompras } from '@/lib/email'

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { userId } = await params
  const body = await request.json().catch(() => ({}))
  const semanas: number[] = Array.isArray(body.semanas) ? body.semanas.map(Number).filter(Number.isInteger) : []
  if (!semanas.length) return NextResponse.json({ error: 'Elegí al menos una semana.' }, { status: 400 })

  const cliente = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      nombre: true, email: true,
      perfil: { select: { supermercado: true } },
      shoppingLists: { where: { semana: { in: semanas } }, orderBy: { semana: 'asc' }, include: { items: true } },
    },
  })
  if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 })
  if (!cliente.shoppingLists.length) return NextResponse.json({ error: 'No hay listas cargadas para esas semanas.' }, { status: 400 })

  const enviadas: number[] = []
  for (const lista of cliente.shoppingLists) {
    const ok = await enviarListaCompras({
      nombre: cliente.nombre,
      email: cliente.email,
      semana: lista.semana,
      notas: lista.notas,
      items: lista.items,
      supermercado: cliente.perfil?.supermercado ?? null,
    })
    if (!ok) break
    await prisma.shoppingList.update({ where: { id: lista.id }, data: { enviadoEn: new Date() } })
    enviadas.push(lista.semana)
  }

  if (!enviadas.length) return NextResponse.json({ error: 'No se pudo enviar el mail. Revisá GMAIL_USER / GMAIL_APP_PASSWORD.' }, { status: 502 })
  return NextResponse.json({ ok: true, enviadas })
}
