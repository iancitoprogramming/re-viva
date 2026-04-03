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

  const { searchParams } = new URL(request.url)
  const busqueda = searchParams.get('busqueda')?.trim() ?? ''
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit    = Math.min(30, Math.max(10, parseInt(searchParams.get('limit') ?? '20', 10)))
  const skip     = (page - 1) * limit

  const where = busqueda
    ? {
        deletedAt: null,
        OR: [
          { nombre: { contains: busqueda, mode: 'insensitive' as const } },
          { email:  { contains: busqueda, mode: 'insensitive' as const } },
        ],
      }
    : { deletedAt: null }

  const [clientes, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { creadoEn: 'desc' },
      skip,
      take: limit,
      include: {
        perfil: { select: { id: true } },
        plan:   { select: { estado: true, activadoEn: true, fechaVencimiento: true, tipoPlan: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    clientes: clientes.map(c => ({
      id:          c.id,
      nombre:      c.nombre,
      email:       c.email,
      creadoEn:    c.creadoEn,
      tienePerfil: !!c.perfil,
      plan:        c.plan,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
