// GET /api/leaderboard — Ranking de clientes activos por actividad
// Requiere JWT. Solo muestra clientes con plan ACTIVO (sin revelar datos sensibles).

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const periodo = searchParams.get('periodo') ?? 'semanal' // semanal | mensual | historico

  const ahora = new Date()
  let desde: Date

  if (periodo === 'semanal') {
    desde = new Date(ahora)
    desde.setDate(ahora.getDate() - 7)
  } else if (periodo === 'mensual') {
    desde = new Date(ahora)
    desde.setDate(ahora.getDate() - 30)
  } else {
    desde = new Date('2024-01-01')
  }
  desde.setUTCHours(0, 0, 0, 0)

  // Traer solo clientes activos (no eliminados, con plan ACTIVO)
  const clientes = await prisma.user.findMany({
    where: {
      deletedAt: null,
      plan: { estado: 'ACTIVO' },
    },
    select: {
      id: true,
      nombre: true,
      checkIns: {
        where: {
          confirmado: true,
          fecha: { gte: desde },
        },
        select: { fecha: true, tipo: true },
      },
    },
  })

  // Calcular métricas para cada cliente
  const entries = clientes.map(c => {
    const checkins = c.checkIns
    const total    = checkins.length

    // Racha: días consecutivos hasta hoy con al menos 1 check-in
    const diasConActividad = new Set(
      checkins.map(ch => {
        const d = new Date(ch.fecha)
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

    // Consistencia semanal (últimos 7 días)
    const hace7 = new Date(ahora)
    hace7.setDate(ahora.getDate() - 7)
    hace7.setUTCHours(0, 0, 0, 0)
    const diasActivosSemana = new Set(
      c.checkIns
        .filter(ch => new Date(ch.fecha) >= hace7)
        .map(ch => {
          const d = new Date(ch.fecha)
          d.setUTCHours(0, 0, 0, 0)
          return d.getTime()
        })
    ).size

    // Puntaje compuesto:
    // - 1 punto por check-in
    // - 2 puntos bonus por racha >= 7
    // - 3 puntos bonus por racha >= 14
    // - 2 puntos bonus por 5+ días activos esta semana
    let puntaje = total
    if (racha >= 14) puntaje += 3
    else if (racha >= 7) puntaje += 2
    if (diasActivosSemana >= 5) puntaje += 2

    return {
      userId:             c.id,
      nombre:             c.nombre,
      totalCheckins:      total,
      rachaActual:        racha,
      consistenciaSemanal: diasActivosSemana,
      puntaje,
    }
  })

  // Ordenar por puntaje desc, luego por racha, luego por total
  entries.sort((a, b) =>
    b.puntaje - a.puntaje ||
    b.rachaActual - a.rachaActual ||
    b.totalCheckins - a.totalCheckins
  )

  const leaderboard = entries.map((e, i) => ({
    ...e,
    posicion:     i + 1,
    // No revelar apellidos: solo primer nombre + inicial
    nombre:       primerNombreConInicial(e.nombre),
    esTuyo:       e.userId === payload.userId,
  }))

  // Posición del usuario actual (siempre incluir aunque no esté en top)
  const miPosicion = leaderboard.find(e => e.esTuyo) ?? null

  return NextResponse.json({ leaderboard: leaderboard.slice(0, 20), miPosicion, periodo })
}

function primerNombreConInicial(nombre: string): string {
  const partes = nombre.trim().split(' ')
  if (partes.length === 1) return partes[0]
  return `${partes[0]} ${partes[1][0]}.`
}
