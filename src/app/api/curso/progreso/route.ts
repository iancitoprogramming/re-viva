import { NextRequest, NextResponse } from 'next/server'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const token = obtenerTokenDeRequest(req)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Token inválido' }, { status: 401 })

  const { slug, capitulo } = await req.json()
  if (!slug || !capitulo) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const progreso = await prisma.cursoProgreso.upsert({
    where: { userId_slug: { userId: payload.userId, slug } },
    update: {
      ultimoCapitulo: capitulo,
      completados: { push: capitulo },
    },
    create: {
      userId: payload.userId,
      slug,
      ultimoCapitulo: capitulo,
      completados: [capitulo],
    },
  })

  // Deduplicar completados
  const unique = [...new Set(progreso.completados)]
  if (unique.length !== progreso.completados.length) {
    await prisma.cursoProgreso.update({
      where: { userId_slug: { userId: payload.userId, slug } },
      data: { completados: unique },
    })
  }

  return NextResponse.json({ ok: true })
}
