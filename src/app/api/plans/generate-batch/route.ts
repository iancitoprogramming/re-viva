// POST /api/plans/generate-batch
// Batch upload: admin provee una lista de userIds y se corre el pipeline
// para cada uno. Ejecuta con concurrencia limitada para no saturar la API
// de Anthropic ni el connection pool de la DB.
//
// Body:
//   { userIds: string[], concurrency?: number (default 3), overrides?: object }
//
// Responde con un resumen agregado + resultado individual por userId.

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth';
import { correrPipeline, perfilDbAClientProfile } from '@/lib/plans/pipeline';
import type { PipelineResult, PipelineStatus } from '@/lib/plans/types';

interface BatchItemResult {
  userId: string;
  email?: string;
  ok: boolean;
  status?: PipelineStatus;
  error?: string;
  reviewId?: string;
  planId?: string;
  proofreaderStatus?: string;
  observacionesCount?: number;
}

interface BatchSummary {
  total: number;
  ok: number;
  errores: number;
  porStatus: Record<string, number>;
  iniciadoEn: string;
  completadoEn: string;
  duracionMs: number;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}

// Ejecuta tareas en paralelo con límite de concurrencia
async function runWithLimit<T>(
  items: T[],
  limit: number,
  fn: (item: T, idx: number) => Promise<BatchItemResult>,
): Promise<BatchItemResult[]> {
  const resultados: BatchItemResult[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        resultados[i] = await fn(items[i], i);
      } catch (err) {
        resultados[i] = {
          userId: (items[i] as unknown as { id?: string }).id ?? '?',
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return resultados;
}

export async function POST(request: Request) {
  const token = obtenerTokenDeRequest(request);
  if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  const payload = verificarToken(token);
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json(
      { error: 'Solo administradores pueden ejecutar batch.' },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.userIds) || body.userIds.length === 0) {
    return NextResponse.json(
      { error: 'Body debe incluir "userIds": string[] con al menos 1 elemento.' },
      { status: 400 },
    );
  }

  const userIds: string[] = [...new Set(body.userIds)].filter((x): x is string => typeof x === 'string');
  const concurrency = Math.min(Math.max(1, Number(body.concurrency) || 3), 10);
  const overrides = body.overrides ?? {};
  const ip = getClientIp(request);

  if (userIds.length > 200) {
    return NextResponse.json(
      { error: 'Batch limitado a 200 clientes por request. Dividir en múltiples llamadas.' },
      { status: 400 },
    );
  }

  // Precargar todos los usuarios + perfiles de una sola vez para evitar
  // N+1 queries durante el pipeline
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    include: { perfil: true },
  });
  const usersById = new Map(users.map((u) => [u.id, u]));

  const iniciadoEn = new Date();

  const resultados = await runWithLimit(userIds, concurrency, async (userId) => {
    const user = usersById.get(userId);
    if (!user) {
      return { userId, ok: false, error: 'Usuario no encontrado.' };
    }
    if (!user.perfil) {
      return { userId, email: user.email, ok: false, error: 'Cliente sin perfil de onboarding.' };
    }

    try {
      const perfil = perfilDbAClientProfile(user, user.perfil, overrides, ip);
      const r: PipelineResult = await correrPipeline(perfil);

      const esOk = !r.status.startsWith('error') && r.status !== 'blocked_consents';
      return {
        userId,
        email: user.email,
        ok: esOk,
        status: r.status,
        planId: r.planId,
        reviewId: r.reviewId,
        proofreaderStatus: r.proofreaderStatus,
        observacionesCount: r.observacionesCount,
        error: esOk ? undefined : r.error ?? r.status,
      };
    } catch (err) {
      return {
        userId,
        email: user.email,
        ok: false,
        error: err instanceof Error ? err.message : 'Error inesperado en pipeline',
      };
    }
  });

  const completadoEn = new Date();
  const porStatus: Record<string, number> = {};
  for (const r of resultados) {
    const key = r.ok ? (r.status ?? 'ok') : 'error';
    porStatus[key] = (porStatus[key] ?? 0) + 1;
  }

  const summary: BatchSummary = {
    total: resultados.length,
    ok: resultados.filter((r) => r.ok).length,
    errores: resultados.filter((r) => !r.ok).length,
    porStatus,
    iniciadoEn: iniciadoEn.toISOString(),
    completadoEn: completadoEn.toISOString(),
    duracionMs: completadoEn.getTime() - iniciadoEn.getTime(),
  };

  return NextResponse.json(
    { summary, resultados },
    { status: 202 },
  );
}
