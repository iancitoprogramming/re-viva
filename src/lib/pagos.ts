// Registro del resultado de un pago de Mercado Pago.
// Lo usan /api/payments/process (respuesta inmediata del brick) y
// /api/payments/webhook (notificación asíncrona). Es idempotente: MP puede
// avisar varias veces del mismo pago.

import { prisma } from '@/lib/prisma'
import { ES_EBOOK } from '@/lib/constants'
import { enviarNotificacionPagoAprobado } from '@/lib/email'

export async function registrarResultadoPago(
  paymentDbId: string,
  mpPaymentId: string,
  status: string,
): Promise<void> {
  const previo = await prisma.payment.findUnique({
    where: { id: paymentDbId },
    include: { user: { select: { nombre: true, email: true } } },
  })
  if (!previo) return

  // Un pago aprobado no vuelve atrás por una notificación vieja o fuera de orden.
  const yaAprobado = previo.status === 'approved'
  if (yaAprobado && status !== 'approved' && status !== 'refunded' && status !== 'charged_back') return

  await prisma.payment.update({
    where: { id: paymentDbId },
    data: { paymentId: mpPaymentId, status },
  })

  if (status !== 'approved' || yaAprobado) return

  if (ES_EBOOK.has(previo.planTipo)) {
    await prisma.ebookEntrega.upsert({
      where:  { paymentId: previo.id },
      create: { userId: previo.userId, paymentId: previo.id, planTipo: previo.planTipo },
      update: {},
    })
  } else {
    // Deja anotado qué plan pagó, así el trainer lo ve al activar.
    await prisma.nutritionalPlan.updateMany({
      where: { userId: previo.userId, estado: 'PENDIENTE', tipoPlan: null },
      data:  { tipoPlan: previo.planTipo },
    })
  }

  void enviarNotificacionPagoAprobado(
    previo.user.nombre,
    previo.user.email,
    previo.planTipo,
    previo.amount,
  )
}
