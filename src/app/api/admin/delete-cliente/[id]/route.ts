// DELETE /api/admin/delete-cliente/[id] — Soft delete de un cliente (admin)
// Setea deletedAt en lugar de borrar. Preserva historial.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(request: Request, ctx: RouteContext) {
  const { id } = await ctx.params
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  // No dejar eliminar admins por error
  const cliente = await prisma.user.findUnique({ where: { id } })
  if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 })
  if (esAdmin(cliente.email)) {
    return NextResponse.json({ error: 'No podés eliminar una cuenta de admin.' }, { status: 403 })
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  return NextResponse.json({ ok: true, mensaje: 'Cliente eliminado correctamente.' })
}

// PATCH para restaurar si es necesario
export async function PATCH(request: Request, ctx: RouteContext) {
  const { id } = await ctx.params
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: null },
  })

  return NextResponse.json({ ok: true, mensaje: 'Cliente restaurado.' })
}
