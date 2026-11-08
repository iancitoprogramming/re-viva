// GET    /api/admin/altas/[id] — ficha completa: alertas, prompt y datos crudos.
// PATCH  /api/admin/altas/[id] — estado y notas internas.
//
// Las alertas y el prompt se calculan al vuelo desde los horarios: nada de esto
// se guarda en la tabla.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'
import { construirFicha, datosCrudos, type AltaFicha } from '@/lib/ficha'
import { ESTADOS_ALTA } from '@/lib/ingreso'

type AltaDB = Awaited<ReturnType<typeof prisma.alta.findUnique>>

function aFicha(alta: NonNullable<AltaDB>): AltaFicha {
  return {
    ...alta,
    pesoKg: Number(alta.pesoKg),
    horariosEntrenamiento: (alta.horariosEntrenamiento ?? {}) as Record<string, string>,
    horariosComidas: (alta.horariosComidas ?? {}) as Record<string, string | null>,
  } as AltaFicha
}

function autorizar(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
  }
  return null
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denegado = autorizar(request)
  if (denegado) return denegado

  const { id } = await params
  const alta = await prisma.alta.findUnique({ where: { id } })
  if (!alta) return NextResponse.json({ error: 'Alta no encontrada.' }, { status: 404 })

  const ficha = aFicha(alta)
  const { alertas, prompt, tmb } = construirFicha(ficha)

  return NextResponse.json({
    alta: { ...ficha, creadoEn: alta.creadoEn },
    alertas,
    prompt,
    tmb,
    crudos: datosCrudos(ficha),
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denegado = autorizar(request)
  if (denegado) return denegado

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const { estado, notasInternas } = (body ?? {}) as { estado?: unknown; notasInternas?: unknown }
  const data: { estado?: string; notasInternas?: string | null } = {}

  if (estado !== undefined) {
    if (typeof estado !== 'string' || !(ESTADOS_ALTA as readonly string[]).includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
    }
    data.estado = estado
  }

  if (notasInternas !== undefined) {
    if (typeof notasInternas !== 'string') {
      return NextResponse.json({ error: 'Notas inválidas.' }, { status: 400 })
    }
    data.notasInternas = notasInternas.trim() === '' ? null : notasInternas.trim()
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: 'Nada que actualizar.' }, { status: 400 })
  }

  try {
    const alta = await prisma.alta.update({
      where: { id },
      data,
      select: { id: true, estado: true, notasInternas: true },
    })
    return NextResponse.json({ ok: true, alta })
  } catch (err) {
    console.error('[ALTAS] Error actualizando el alta:', (err as Error).message)
    return NextResponse.json({ error: 'Alta no encontrada.' }, { status: 404 })
  }
}
