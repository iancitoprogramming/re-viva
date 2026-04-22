// POST /api/admin/reviews/:planId/reject

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const token = obtenerTokenDeRequest(request);
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const payload = verificarToken(token);
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });

  const { planId } = await params;
  const body = await request.json().catch(() => ({}));
  const motivo: string = body.motivo ?? 'Rechazado por el trainer sin motivo especificado';

  const review = await prisma.pendingTrainerReview.findUnique({ where: { id: planId } });
  if (!review) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
  if (review.estado !== 'PENDIENTE')
    return NextResponse.json({ error: 'Solo se pueden rechazar planes en estado PENDIENTE.' }, { status: 409 });

  await prisma.pendingTrainerReview.update({
    where: { id: planId },
    data: {
      estado: 'RECHAZADO',
      modificacionesJson: {
        ...((review.modificacionesJson as object) ?? {}),
        rechazo: {
          rechazadoPor: payload.email,
          timestamp: new Date().toISOString(),
          motivo,
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
