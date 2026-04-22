// GET /api/admin/reviews/:planId — detalle completo de un plan

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const token = obtenerTokenDeRequest(request);
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const payload = verificarToken(token);
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });

  const { planId } = await params;

  const review = await prisma.pendingTrainerReview.findUnique({
    where: { id: planId },
    include: {
      client: { select: { id: true, nombre: true, email: true } },
      planGeneration: true,
    },
  });

  if (!review) return NextResponse.json({ error: 'Revisión no encontrada.' }, { status: 404 });

  return NextResponse.json(review);
}

// PATCH /api/admin/reviews/:planId — actualizar planJson (edición inline)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ planId: string }> },
) {
  const token = obtenerTokenDeRequest(request);
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const payload = verificarToken(token);
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });

  const { planId } = await params;
  const body = await request.json().catch(() => null);
  if (!body?.planJson) return NextResponse.json({ error: 'planJson requerido.' }, { status: 400 });

  // Registrar qué cambió para auditoría
  const actual = await prisma.pendingTrainerReview.findUnique({
    where: { id: planId },
    select: { planJson: true, modificacionesJson: true },
  });
  if (!actual) return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });

  const modificaciones = {
    ...((actual.modificacionesJson as object) ?? {}),
    [`edit_${Date.now()}`]: {
      editadoPor: payload.email,
      timestamp: new Date().toISOString(),
    },
  };

  const updated = await prisma.pendingTrainerReview.update({
    where: { id: planId },
    data: {
      planJson: body.planJson,
      modificacionesJson: modificaciones,
    },
  });

  return NextResponse.json({ ok: true, actualizadoEn: updated.actualizadoEn });
}
