// Piezas puras del webhook de Mercado Pago: validación de firma y URL de aviso.
// Sin Prisma ni SDK, para poder testearlas.

import { createHmac, timingSafeEqual } from 'crypto'

// Estados que pueden llegar sobre un pago que ya estaba aprobado.
export const REVERSIONES = new Set(['refunded', 'charged_back'])

// URL que viaja como notification_url en preferencias y pagos.
// source_news=webhooks evita que MP mande además la notificación IPN vieja (sin firma).
export function urlNotificacion(): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://re-viva.vercel.app'
  return `${base}/api/payments/webhook?source_news=webhooks`
}

// Firma de MP: header x-signature = "ts=<ts>,v1=<hmac>" y el HMAC-SHA256 del
// manifest "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" con la clave secreta.
// Si data.id es alfanumérico, MP lo firma en minúsculas.
export function firmaValida(datos: {
  xSignature: string | null
  xRequestId: string | null
  dataId: string
  secret: string
}): boolean {
  const partes: Record<string, string> = {}
  for (const parte of (datos.xSignature ?? '').split(',')) {
    const [clave, ...valor] = parte.trim().split('=')
    if (clave) partes[clave] = valor.join('=')
  }
  if (!partes.ts || !partes.v1) return false

  let manifest = `id:${datos.dataId.toLowerCase()};`
  if (datos.xRequestId) manifest += `request-id:${datos.xRequestId};`
  manifest += `ts:${partes.ts};`

  const esperado = createHmac('sha256', datos.secret).update(manifest).digest('hex')
  const a = Buffer.from(esperado)
  const b = Buffer.from(partes.v1)
  return a.length === b.length && timingSafeEqual(a, b)
}
