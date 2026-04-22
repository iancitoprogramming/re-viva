// GET /api/admin/reviews — cola de planes pendientes de revisión

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth';

const PRIORIDAD_ORDEN: Record<string, number> = { alta: 0, media: 1, baja: 2 };

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request);
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const payload = verificarToken(token);
  if (!payload || !esAdmin(payload.email))
    return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const estado = searchParams.get('estado') ?? 'PENDIENTE';
  const soloAlta = searchParams.get('soloAlta') === '1';

  const reviews = await prisma.pendingTrainerReview.findMany({
    where: {
      estado,
      ...(soloAlta ? { prioridad: 'alta' } : {}),
    },
    include: {
      client: { select: { id: true, nombre: true, email: true } },
      planGeneration: { select: { modelUsed: true, costUSD: true, creadoEn: true } },
    },
    orderBy: [{ creadoEn: 'desc' }],
  });

  // Ordenar por prioridad en memoria
  const ordenadas = reviews.sort(
    (a, b) => (PRIORIDAD_ORDEN[a.prioridad] ?? 3) - (PRIORIDAD_ORDEN[b.prioridad] ?? 3),
  );

  // Conteos por estado
  const [totalPendiente, totalAlta, totalAprobado, totalRechazado] = await Promise.all([
    prisma.pendingTrainerReview.count({ where: { estado: 'PENDIENTE' } }),
    prisma.pendingTrainerReview.count({ where: { estado: 'PENDIENTE', prioridad: 'alta' } }),
    prisma.pendingTrainerReview.count({ where: { estado: 'APROBADO' } }),
    prisma.pendingTrainerReview.count({ where: { estado: 'RECHAZADO' } }),
  ]);

  return NextResponse.json({
    reviews: ordenadas.map((r) => ({
      id: r.id,
      clientId: r.clientId,
      clienteNombre: r.client.nombre,
      clienteEmail: r.client.email,
      prioridad: r.prioridad,
      estado: r.estado,
      proofreaderStatus: r.proofreaderStatus,
      requiereRevisionManual: r.requiereRevisionManual,
      flagsDetectados: r.flagsDetectados,
      observacionesCount: r.proofreaderReportJson
        ? (r.proofreaderReportJson as { observaciones?: unknown[] }).observaciones?.length ?? 0
        : 0,
      modelUsed: r.planGeneration.modelUsed,
      costUSD: r.planGeneration.costUSD,
      creadoEn: r.creadoEn,
      aprobadoAt: r.aprobadoAt,
      entregadoAt: r.entregadoAt,
    })),
    stats: {
      totalPendiente,
      totalAlta,
      totalAprobado,
      totalRechazado,
    },
  });
}
