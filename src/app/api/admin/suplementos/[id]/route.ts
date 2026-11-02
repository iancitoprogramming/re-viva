// PATCH  /api/admin/suplementos/[id] → editar (link de afiliado, marca, activo...)
// DELETE /api/admin/suplementos/[id] → borrar (también borra sus clics)

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminDeRequest } from '@/lib/auth'
import { datosSuplemento } from '../validar'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params

  const resultado = datosSuplemento(await request.json().catch(() => ({})), false)
  if ('error' in resultado) return NextResponse.json({ error: resultado.error }, { status: 400 })

  const actual = await prisma.suplemento.findUnique({ where: { id } })
  if (!actual) return NextResponse.json({ error: 'No existe.' }, { status: 404 })

  const linkFinal = 'linkAfiliado' in resultado.data ? resultado.data.linkAfiliado : actual.linkAfiliado
  if (resultado.data.activo === true && !linkFinal) {
    return NextResponse.json({ error: 'Para activarlo primero cargá el link de afiliado.' }, { status: 400 })
  }

  const item = await prisma.suplemento.update({ where: { id }, data: resultado.data })
  return NextResponse.json({ ok: true, item })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  const { id } = await params
  await prisma.suplemento.delete({ where: { id } }).catch(() => null)
  return NextResponse.json({ ok: true })
}
