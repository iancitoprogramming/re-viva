// GET  /api/admin/suplementos → catálogo completo + clics de los últimos 30 días
// POST /api/admin/suplementos → alta de producto

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminDeRequest } from '@/lib/auth'
import { datosSuplemento } from './validar'

export async function GET(request: Request) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [items, clicks] = await Promise.all([
    prisma.suplemento.findMany({ orderBy: [{ activo: 'desc' }, { prioridad: 'desc' }, { nombre: 'asc' }] }),
    prisma.suplementoClick.groupBy({ by: ['suplementoId'], where: { creadoEn: { gte: desde } }, _count: true }),
  ])
  const clicks30d = Object.fromEntries(clicks.map(c => [c.suplementoId, c._count]))

  return NextResponse.json({ items: items.map(s => ({ ...s, clicks30d: clicks30d[s.id] ?? 0 })) })
}

export async function POST(request: Request) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const resultado = datosSuplemento(await request.json().catch(() => ({})), true)
  if ('error' in resultado) return NextResponse.json({ error: resultado.error }, { status: 400 })

  try {
    const item = await prisma.suplemento.create({ data: resultado.data as Parameters<typeof prisma.suplemento.create>[0]['data'] })
    return NextResponse.json({ ok: true, item })
  } catch {
    return NextResponse.json({ error: 'Ya existe un producto con ese slug.' }, { status: 409 })
  }
}
