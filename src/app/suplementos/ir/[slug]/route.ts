// GET /suplementos/ir/<slug>?o=catalogo|documento|mail
// Registra el clic y redirige al link de afiliado (mismo esquema que skincare).

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ORIGENES = new Set(['catalogo', 'documento', 'mail'])

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const url = new URL(request.url)

  const suplemento = await prisma.suplemento.findUnique({
    where: { slug },
    select: { id: true, linkAfiliado: true, activo: true },
  })
  if (!suplemento?.activo || !suplemento.linkAfiliado) {
    return NextResponse.redirect(new URL('/suplementos', url.origin), 302)
  }

  const origen = url.searchParams.get('o')
  try {
    await prisma.suplementoClick.create({
      data: {
        suplementoId: suplemento.id,
        origen: origen && ORIGENES.has(origen) ? origen : null,
        referrer: request.headers.get('referer')?.slice(0, 500) ?? null,
      },
    })
  } catch (e) {
    // El clic nunca bloquea la compra
    console.error('[SUPLEMENTOS] No se pudo registrar el clic:', e)
  }

  return NextResponse.redirect(suplemento.linkAfiliado, 302)
}
