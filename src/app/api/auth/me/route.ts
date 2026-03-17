import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 })

  const usuario = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      perfil: true,
      plan: true,
    },
  })

  if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })

  return NextResponse.json({
    id:          usuario.id,
    nombre:      usuario.nombre,
    email:       usuario.email,
    esAdmin:     esAdmin(usuario.email),
    tienePerfil: !!usuario.perfil,
    plan:        usuario.plan ?? null,
  })
}
