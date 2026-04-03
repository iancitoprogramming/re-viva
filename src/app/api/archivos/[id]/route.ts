// GET /api/archivos/[id] — Acceso autenticado a un archivo del cliente
// Verifica que el archivo pertenezca al usuario autenticado, luego redirige a la URL del blob.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(request: Request, ctx: RouteContext) {
  const { id } = await ctx.params
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 })

  const archivo = await prisma.archivo.findUnique({ where: { id } })
  if (!archivo) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404 })

  // Sólo el dueño o un admin puede acceder
  if (archivo.userId !== payload.userId && !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Sin acceso.' }, { status: 403 })
  }

  // Redirigir al Blob URL (la URL ya es de Vercel Blob, acceso controlado aquí)
  return NextResponse.redirect(archivo.url)
}
