import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  const { id } = await params

  const cliente = await prisma.user.findUnique({
    where: { id },
    include: { perfil: true, plan: true },
  })

  if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 })

  return NextResponse.json({
    id:       cliente.id,
    nombre:   cliente.nombre,
    email:    cliente.email,
    creadoEn: cliente.creadoEn,
    perfil:   cliente.perfil,
    plan:     cliente.plan,
  })
}
