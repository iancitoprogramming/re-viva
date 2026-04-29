// POST /api/admin/reviews/:planId/approve
// Genera DOCX, lo sube a Vercel Blob, crea Archivo, envía email, marca APROBADO.

import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth';
import { generarDocxDePlan } from '@/lib/plans/planToDocx';
import type { GeneratedPlan } from '@/lib/plans/types';
import { enviarEmailActivacion } from '@/lib/email';

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

  const review = await prisma.pendingTrainerReview.findUnique({
    where: { id: planId },
    include: { client: true },
  });

  if (!review) return NextResponse.json({ error: 'Revisión no encontrada.' }, { status: 404 });
  if (review.estado === 'APROBADO')
    return NextResponse.json({ error: 'Este plan ya fue aprobado.' }, { status: 409 });

  const plan = review.planJson as unknown as GeneratedPlan;

  // 1. Generar DOCX
  const docxBuffer = await generarDocxDePlan(
    plan,
    review.client.nombre,
    review.client.email,
  );

  // 2. Subir a Vercel Blob
  const nombreArchivo = `plan-${review.client.nombre.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.docx`;
  const blob = await put(`plans/${review.clientId}/${nombreArchivo}`, docxBuffer, {
    access: 'public',
    contentType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  // 3. Crear registro Archivo para el cliente
  await prisma.archivo.create({
    data: {
      userId: review.clientId,
      nombre: `Plan personalizado — ${new Date().toLocaleDateString('es-AR')}`,
      tipo: 'alimentacion',
      url: blob.url,
      nombreOriginal: nombreArchivo,
      tamano: docxBuffer.byteLength,
      subidoPor: payload.email,
    },
  });

  // 4. Enviar email al cliente (async, no bloquea)
  const re = plan.resumenEjecutivo;
  enviarEmailActivacion(
    review.client.nombre,
    review.client.email,
    plan.metaInfo.flagsDetectados.includes('perdida_grasa') ? 'DEFINICION' : 'VOLUMEN',
    re.caloriesDiarias,
    re.macros.proteinaG,
    re.macros.carbosG,
    re.macros.grasaG,
    body.notasTrainer ?? null,
  ).catch((err: unknown) =>
    console.error('[APPROVE] Error enviando email:', err),
  );

  // 5. Marcar como APROBADO con auditoría
  const now = new Date();
  await prisma.pendingTrainerReview.update({
    where: { id: planId },
    data: {
      estado: 'APROBADO',
      aprobadoPorTrainerId: payload.userId,
      aprobadoAt: now,
      entregadoAt: now,
      observacionesResueltas: body.observacionesResueltas ?? [],
      modificacionesJson: {
        ...((review.modificacionesJson as object) ?? {}),
        aprobacion: {
          aprobadoPor: payload.email,
          timestamp: now.toISOString(),
          docxUrl: blob.url,
          notasTrainer: body.notasTrainer ?? null,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, docxUrl: blob.url });
}
