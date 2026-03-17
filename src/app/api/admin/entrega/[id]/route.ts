// API para actualizar el estado de entrega de cada componente del plan integral
// Solo accesible para admins

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

const COMPONENTES_VALIDOS = [
  'estadoAlimentacion',
  'estadoEntrenamiento',
  'estadoSuplementacion',
  'estadoMealPrep',
  'estadoListaCompras',
] as const

const ESTADOS_VALIDOS = ['PENDIENTE', 'EN_PROGRESO', 'ENTREGADO'] as const

type Componente = typeof COMPONENTES_VALIDOS[number]
type Estado = typeof ESTADOS_VALIDOS[number]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = obtenerTokenDeRequest(request)
    if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    const payload = verificarToken(token)
    if (!payload || !esAdmin(payload.email)) {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
    }

    const { id: userId } = await params
    const { componente, estado } = await request.json() as { componente: Componente; estado: Estado }

    if (!COMPONENTES_VALIDOS.includes(componente)) {
      return NextResponse.json({ error: 'Componente inválido.' }, { status: 400 })
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
    }

    const plan = await prisma.nutritionalPlan.findUnique({ where: { userId } })
    if (!plan) return NextResponse.json({ error: 'Plan no encontrado.' }, { status: 404 })

    await prisma.nutritionalPlan.update({
      where: { userId },
      data: { [componente]: estado },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[ENTREGA]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
