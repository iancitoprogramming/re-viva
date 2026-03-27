import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  const clientes = await prisma.user.findMany({
    orderBy: { creadoEn: 'desc' },
    include: {
      perfil: { select: { id: true } },
      plan:   { select: { estado: true, activadoEn: true } },
    },
  })

  return NextResponse.json(
    clientes.map(c => ({
      id:         c.id,
      nombre:     c.nombre,
      email:      c.email,
      creadoEn:   c.creadoEn,
      tienePerfil: !!c.perfil,
      plan:       c.plan,
    }))
  )
}
