// Límite de intentos para las rutas públicas de auth.
//
// En Vercel cada instancia tiene su propia memoria, así que un contador en
// memoria no frena nada: el conteo va a la base (tabla RateLimitHit). Si la
// tabla todavía no existe o la base falla, cae a un contador en memoria: es
// más débil, pero nunca deja a un usuario legítimo sin poder entrar.

import { prisma } from '@/lib/prisma'

export function ipDe(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'desconocida'
}

const memoria = new Map<string, number[]>()

function permitidoEnMemoria(clave: string, max: number, ventanaMs: number): boolean {
  const ahora = Date.now()
  const previos = (memoria.get(clave) ?? []).filter(t => ahora - t < ventanaMs)
  if (previos.length >= max) {
    memoria.set(clave, previos)
    return false
  }
  previos.push(ahora)
  memoria.set(clave, previos)
  return true
}

/**
 * Registra un intento y dice si está permitido.
 * @returns true si se puede seguir; false si ya se llegó a `max` en la ventana.
 */
export async function permitirIntento(clave: string, max: number, ventanaSegundos: number): Promise<boolean> {
  const ventanaMs = ventanaSegundos * 1000
  try {
    const desde = new Date(Date.now() - ventanaMs)
    const previos = await prisma.rateLimitHit.count({ where: { clave, creadoEn: { gt: desde } } })
    if (previos >= max) return false

    await prisma.rateLimitHit.create({ data: { clave } })

    // Limpieza ocasional: ninguna ventana supera las 24 h.
    if (Math.random() < 0.02) {
      void prisma.rateLimitHit
        .deleteMany({ where: { creadoEn: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } } })
        .catch(() => null)
    }
    return true
  } catch (error) {
    console.error('[rateLimit] Sin tabla o sin base, uso memoria:', (error as Error)?.message)
    return permitidoEnMemoria(clave, max, ventanaMs)
  }
}

// Borra los intentos de una clave (por ejemplo, después de un login correcto).
export async function limpiarIntentos(clave: string): Promise<void> {
  memoria.delete(clave)
  await prisma.rateLimitHit.deleteMany({ where: { clave } }).catch(() => null)
}

export const DEMASIADOS_INTENTOS = 'Demasiados intentos. Esperá unos minutos y volvé a probar.'
