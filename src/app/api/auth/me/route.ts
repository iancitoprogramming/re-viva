import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 })

  try {
    const usuario = await prisma.user.findFirst({
      where: { id: payload.userId, deletedAt: null },
      include: {
        perfil: true,
        plan: true,
        archivos: {
          orderBy: { subidoEn: 'desc' },
          select: { id: true, nombre: true, tipo: true, nombreOriginal: true, tamano: true, subidoEn: true },
        },
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
      archivos:    usuario.archivos ?? [],
    })
  } catch (err) {
    // Fallback: consulta sin tablas nuevas (por si la migración no corrió aún)
    console.error('[auth/me] Error con query completa, intentando fallback:', err)
    try {
      const usuario = await prisma.user.findFirst({
        where: { id: payload.userId },
        include: { perfil: true, plan: true },
      })
      if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 })
      return NextResponse.json({
        id:          usuario.id,
        nombre:      usuario.nombre,
        email:       usuario.email,
        esAdmin:     esAdmin(usuario.email),
        tienePerfil: !!usuario.perfil,
        plan:        usuario.plan ?? null,
        archivos:    [],
      })
    } catch (err2) {
      console.error('[auth/me] Error en fallback:', err2)
      return NextResponse.json({ error: 'Error interno.' }, { status: 500 })
    }
  }
}
