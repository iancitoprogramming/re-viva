// GET /api/admin/altas — lista de altas del formulario público.
// Solo accesible para admins.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'
import { ESTADOS_ALTA } from '@/lib/ingreso'

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const estado = searchParams.get('estado')?.trim() ?? ''
  const where  = (ESTADOS_ALTA as readonly string[]).includes(estado) ? { estado } : {}

  const altas = await prisma.alta.findMany({
    where,
    orderBy: { creadoEn: 'desc' },
    take: 200,
    select: {
      id: true, nombre: true, creadoEn: true, estado: true, objetivo: true,
      diasEntrenamiento: true,
    },
  })

  return NextResponse.json({
    altas: altas.map(a => ({
      id:       a.id,
      nombre:   a.nombre,
      creadoEn: a.creadoEn,
      estado:   a.estado,
      objetivo: a.objetivo,
      dias:     a.diasEntrenamiento.length,
    })),
    total: altas.length,
  })
}
