// POST /api/admin/ebooks/[id]/entregar  → marca entregado
// DELETE                                 → deshace la marca (por si fue tildado por error)

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const notas: string | undefined = typeof body.notas === 'string' ? body.notas : undefined

  const entrega = await prisma.ebookEntrega.update({
    where: { id },
    data: {
      estado: 'ENTREGADO',
      entregadoEn: new Date(),
      notas: notas ?? undefined,
    },
  })

  return NextResponse.json({ ok: true, entrega })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const { id } = await params
  await prisma.ebookEntrega.update({
    where: { id },
    data: { estado: 'PENDIENTE', entregadoEn: null },
  })
  return NextResponse.json({ ok: true })
}
