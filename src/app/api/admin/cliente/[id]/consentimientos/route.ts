// POST /api/admin/cliente/[id]/consentimientos
// El trainer marca como "revisados en persona / videollamada" los
// consentimientos de un cliente que no los había aceptado online.
//
// Body: { notas?: string }

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const { id: userId } = await params
  const body = await request.json().catch(() => ({}))
  const notas: string | undefined = typeof body.notas === 'string' ? body.notas : undefined

  const perfil = await prisma.nutritionalProfile.findUnique({ where: { userId } })
  if (!perfil) return NextResponse.json({ error: 'El cliente no tiene perfil de onboarding.' }, { status: 404 })

  const actualizado = await prisma.nutritionalProfile.update({
    where: { userId },
    data: {
      consentimientosRevisionPersonal: true,
      consentimientosRevisadoPorTrainerEn: new Date(),
      notasRevisionConsentimientos: notas ?? perfil.notasRevisionConsentimientos,
    },
    select: {
      consentimientosRevisionPersonal: true,
      consentimientosRevisadoPorTrainerEn: true,
      notasRevisionConsentimientos: true,
    },
  })

  return NextResponse.json({ ok: true, ...actualizado })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // Permite "deshacer" la marca de revisado (por si fue tildado por error)
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const { id: userId } = await params
  await prisma.nutritionalProfile.update({
    where: { userId },
    data: {
      consentimientosRevisionPersonal: false,
      consentimientosRevisadoPorTrainerEn: null,
    },
  })

  return NextResponse.json({ ok: true })
}
