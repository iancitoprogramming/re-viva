// GET /api/admin/consentimientos-pendientes
// Devuelve los clientes que completaron onboarding pero NO aceptaron los 4
// consentimientos legales y todavía no fueron revisados por el trainer en
// persona / videollamada.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const perfiles = await prisma.nutritionalProfile.findMany({
    where: {
      consentimientosRevisionPersonal: false,
      OR: [
        { aceptaTerminosYCondiciones: false },
        { aceptaPoliticaPrivacidad: false },
        { aceptaDescargoMedicoYResponsabilidad: false },
        { confirmaVeracidadDatos: false },
      ],
    },
    include: {
      user: { select: { id: true, nombre: true, email: true, creadoEn: true } },
    },
    orderBy: { creadoEn: 'asc' }, // los más viejos primero (más urgentes)
  })

  const items = perfiles.map(p => ({
    userId: p.user.id,
    nombre: p.user.nombre,
    email: p.user.email,
    onboardingEn: p.creadoEn.toISOString(),
    consentimientos: {
      aceptaTerminosYCondiciones: p.aceptaTerminosYCondiciones,
      aceptaPoliticaPrivacidad: p.aceptaPoliticaPrivacidad,
      aceptaDescargoMedicoYResponsabilidad: p.aceptaDescargoMedicoYResponsabilidad,
      confirmaVeracidadDatos: p.confirmaVeracidadDatos,
    },
  }))

  return NextResponse.json({ items, total: items.length })
}
