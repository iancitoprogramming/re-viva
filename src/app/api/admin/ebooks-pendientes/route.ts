// GET /api/admin/ebooks-pendientes
// Lista las compras de ebooks/cursos confirmadas por MP que todavía no
// fueron enviadas al cliente por WhatsApp.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const url = new URL(request.url)
  const incluirEntregados = url.searchParams.get('incluirEntregados') === '1'

  const items = await prisma.ebookEntrega.findMany({
    where: incluirEntregados ? {} : { estado: 'PENDIENTE' },
    include: {
      user: { select: { nombre: true, email: true } },
      payment: { select: { amount: true, paymentId: true, creadoEn: true } },
    },
    orderBy: { creadoEn: 'desc' },
  })

  const totalPendientes = await prisma.ebookEntrega.count({ where: { estado: 'PENDIENTE' } })

  return NextResponse.json({
    items: items.map(it => ({
      id: it.id,
      userId: it.userId,
      planTipo: it.planTipo,
      estado: it.estado,
      creadoEn: it.creadoEn.toISOString(),
      entregadoEn: it.entregadoEn?.toISOString() ?? null,
      notas: it.notas,
      cliente: { nombre: it.user.nombre, email: it.user.email },
      pago: {
        amount: it.payment.amount,
        paymentId: it.payment.paymentId,
        fecha: it.payment.creadoEn.toISOString(),
      },
    })),
    totalPendientes,
  })
}
