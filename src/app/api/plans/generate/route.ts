// POST /api/plans/generate
// Intake individual: recibe ClientProfile (o userId para usar perfil existente)
// y corre el pipeline completo. El plan queda en pending_trainer_review.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth';
import { correrPipeline, perfilDbAClientProfile } from '@/lib/plans/pipeline';
import type { ClientProfile } from '@/lib/plans/types';

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}

export async function POST(request: Request) {
  const token = obtenerTokenDeRequest(request);
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  const payload = verificarToken(token);
  if (!payload) return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Body inválido.' }, { status: 400 });

  const ip = getClientIp(request);

  let perfil: ClientProfile;

  // Modo 1: Admin provee userId → usa perfil existente en DB
  if (body.userId && esAdmin(payload.email)) {
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
      include: { perfil: true },
    });

    if (!user) return NextResponse.json({ error: 'Cliente no encontrado.' }, { status: 404 });
    if (!user.perfil) return NextResponse.json({ error: 'El cliente no tiene perfil de onboarding.' }, { status: 422 });

    perfil = perfilDbAClientProfile(user, user.perfil, body.overrides ?? {}, ip);

  // Modo 2: Admin o cliente provee ClientProfile completo
  } else if (body.perfil) {
    // Si no es admin, solo puede generar para sí mismo
    if (!esAdmin(payload.email) && body.perfil.id !== payload.userId) {
      return NextResponse.json({ error: 'No autorizado para generar plan de otro cliente.' }, { status: 403 });
    }
    perfil = body.perfil as ClientProfile;
    // Forzar IP real
    perfil.consentimientos = { ...perfil.consentimientos, ipAceptacion: ip };

  } else {
    return NextResponse.json(
      { error: 'Proveer userId (admin) o perfil completo.' },
      { status: 400 },
    );
  }

  const resultado = await correrPipeline(perfil);

  const statusHttp = resultado.status.startsWith('error') || resultado.status === 'blocked_consents'
    ? 400
    : 202; // 202 Accepted — plan en cola, no entregado aún

  return NextResponse.json(resultado, { status: statusHttp });
}
