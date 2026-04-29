// POST /api/admin/reviews/:planId/regenerate
// Rechaza el plan actual y encola para regeneración automática.

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
  const motivo: string = body.motivo ?? 'Regeneración solicitada por el trainer';

  const review = await prisma.pendingTrainerReview.findUnique({ where: { id: planId } });
  if (!review) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });

  // Verificar que no exceda el máximo de reintentos
  const intentosPrevios = await prisma.planToRegenerate.count({
    where: { clientId: review.clientId, estado: { not: 'COMPLETADO' } },
  });
  if (intentosPrevios >= 2) {
    return NextResponse.json(
      { error: 'Se alcanzó el límite de 2 regeneraciones automáticas. Resolver manualmente.' },
      { status: 422 },
    );
  }

  await prisma.$transaction([
    prisma.pendingTrainerReview.update({
      where: { id: planId },
      data: {
        estado: 'RECHAZADO',
        modificacionesJson: {
          ...((review.modificacionesJson as object) ?? {}),
          regeneracion: {
            solicitadoPor: payload.email,
            timestamp: new Date().toISOString(),
            motivo,
          },
        },
      },
    }),
    prisma.planToRegenerate.create({
      data: {
        clientId: review.clientId,
        originalPlanId: planId,
        motivoRechazo: motivo,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, mensaje: 'Plan encolado para regeneración.' });
}
