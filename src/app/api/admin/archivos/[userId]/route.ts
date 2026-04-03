// POST /api/admin/archivos/[userId] — Subir archivo para un cliente (admin)
// GET  /api/admin/archivos/[userId] — Listar archivos de un cliente (admin)
// DELETE /api/admin/archivos/[userId]?archivoId=... — Eliminar archivo (admin)

import { NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

const TIPOS_VALIDOS = ['rutina', 'alimentacion', 'suplementacion', 'meal_prep', 'otro']
const MAX_SIZE_BYTES = 20 * 1024 * 1024 // 20 MB

type RouteContext = { params: Promise<{ userId: string }> }

export async function POST(request: Request, ctx: RouteContext) {
  const { userId } = await ctx.params
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  // Verificar que el cliente existe y no está eliminado
  const cliente = await prisma.user.findFirst({ where: { id: userId, deletedAt: null } })
  if (!cliente) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 })

  const formData = await request.formData()
  const archivo  = formData.get('archivo') as File | null
  const nombre   = (formData.get('nombre') as string | null)?.trim()
  const tipo     = (formData.get('tipo') as string | null)?.trim()

  if (!archivo || !nombre || !tipo) {
    return NextResponse.json({ error: 'Faltan campos: archivo, nombre, tipo.' }, { status: 400 })
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 })
  }

  if (archivo.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'El archivo supera el límite de 20 MB.' }, { status: 400 })
  }

  // Extensión permitida
  const ext = archivo.name.split('.').pop()?.toLowerCase() ?? ''
  if (!['docx', 'pdf', 'xlsx', 'doc'].includes(ext)) {
    return NextResponse.json({ error: 'Solo se permiten archivos DOCX, PDF, XLSX.' }, { status: 400 })
  }

  // Subir a Vercel Blob
  const nombreBlob = `reviva/${userId}/${Date.now()}-${archivo.name.replace(/\s+/g, '_')}`
  const blob = await put(nombreBlob, archivo, {
    access: 'public',
    token: process.env.REVIVA_READ_WRITE_TOKEN,
  })

  const registro = await prisma.archivo.create({
    data: {
      userId,
      nombre:        nombre.slice(0, 120),
      tipo,
      url:           blob.url,
      nombreOriginal: archivo.name,
      tamano:        archivo.size,
      subidoPor:     payload.email,
    },
  })

  return NextResponse.json({ ok: true, archivo: registro })
}

export async function GET(request: Request, ctx: RouteContext) {
  const { userId } = await ctx.params
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  const archivos = await prisma.archivo.findMany({
    where: { userId },
    orderBy: { subidoEn: 'desc' },
  })

  return NextResponse.json({ archivos })
}

export async function DELETE(request: Request, ctx: RouteContext) {
  const { userId } = await ctx.params
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const archivoId = searchParams.get('archivoId')
  if (!archivoId) return NextResponse.json({ error: 'Falta archivoId.' }, { status: 400 })

  const archivo = await prisma.archivo.findFirst({ where: { id: archivoId, userId } })
  if (!archivo) return NextResponse.json({ error: 'Archivo no encontrado.' }, { status: 404 })

  // Eliminar de Vercel Blob
  try { await del(archivo.url, { token: process.env.REVIVA_READ_WRITE_TOKEN }) } catch { /* si falla, igual borramos de DB */ }

  await prisma.archivo.delete({ where: { id: archivoId } })

  return NextResponse.json({ ok: true })
}
