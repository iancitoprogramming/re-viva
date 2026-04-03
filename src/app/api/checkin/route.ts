// POST  /api/checkin  — Crear check-in diario
// GET   /api/checkin  — Listar check-ins del usuario autenticado

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import type { TipoCheckIn } from '@/types'

const TIPOS_VALIDOS: TipoCheckIn[] = ['rutina', 'suplemento', 'peso', 'foto', 'medidas', 'hidratacion']

export async function POST(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 })

  const body = await request.json()
  const { tipo, nota } = body as { tipo: TipoCheckIn; nota?: string }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return NextResponse.json({ error: 'Tipo de check-in inválido.' }, { status: 400 })
  }

  // Anti-trampa: máximo 1 check-in por tipo por día (UTC)
  const hoyInicio = new Date()
  hoyInicio.setUTCHours(0, 0, 0, 0)
  const hoyFin = new Date()
  hoyFin.setUTCHours(23, 59, 59, 999)

  const existente = await prisma.checkIn.findFirst({
    where: {
      userId: payload.userId,
      tipo,
      fecha: { gte: hoyInicio, lte: hoyFin },
    },
  })

  if (existente) {
    return NextResponse.json({ error: 'Ya registraste este check-in hoy.' }, { status: 409 })
  }

  const checkIn = await prisma.checkIn.create({
    data: {
      userId:    payload.userId,
      tipo,
      nota:      nota?.slice(0, 500) || null,
      confirmado: true,
      fecha:     new Date(), // siempre server-side
    },
  })

  return NextResponse.json({ ok: true, checkIn })
}

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const dias = Math.min(90, Math.max(1, parseInt(searchParams.get('dias') ?? '30', 10)))

  const desde = new Date()
  desde.setDate(desde.getDate() - dias)
  desde.setUTCHours(0, 0, 0, 0)

  const checkIns = await prisma.checkIn.findMany({
    where: {
      userId:    payload.userId,
      confirmado: true,
      fecha:     { gte: desde },
    },
    orderBy: { fecha: 'desc' },
  })

  // Calcular racha actual
  const racha = calcularRacha(checkIns.map(c => c.fecha))

  return NextResponse.json({ checkIns, racha })
}

// Calcula cuántos días consecutivos (hasta hoy) tuvo al menos 1 check-in
function calcularRacha(fechas: Date[]): number {
  if (!fechas.length) return 0

  const diasConActividad = new Set(
    fechas.map(f => {
      const d = new Date(f)
      d.setUTCHours(0, 0, 0, 0)
      return d.getTime()
    })
  )

  let racha = 0
  const hoy = new Date()
  hoy.setUTCHours(0, 0, 0, 0)

  let cursor = hoy.getTime()
  while (diasConActividad.has(cursor)) {
    racha++
    cursor -= 86400000
  }

  return racha
}
