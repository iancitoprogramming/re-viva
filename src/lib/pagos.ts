// Registro del resultado de un pago de Mercado Pago.
// Lo usan /api/payments/process (respuesta inmediata del brick) y
// /api/payments/webhook (notificación asíncrona). Es idempotente: MP puede
// avisar varias veces del mismo pago, y el brick y el webhook pueden llegar
// al mismo tiempo. La transición a "approved" se gana con un UPDATE
// condicional, así los efectos (ebook, mail) corren una sola vez.

import { prisma } from '@/lib/prisma'
import { ES_EBOOK, PLAN_LABELS } from '@/lib/constants'
import { REVERSIONES } from '@/lib/mpWebhook'
import { enviarAvisoTrainer, enviarNotificacionPagoAprobado } from '@/lib/email'

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

  if (status === 'approved') {
    const { count } = await prisma.payment.updateMany({
      where: { id: paymentDbId, status: { not: 'approved' } },
      data:  { paymentId: mpPaymentId, status },
    })
    if (count === 0) return // ya estaba aprobado: otro aviso llegó primero

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

    void enviarNotificacionPagoAprobado(previo.user.nombre, previo.user.email, previo.planTipo, previo.amount)
    return
  }

  if (previo.status === 'approved') {
    // Un pago aprobado solo cambia por una devolución o contracargo de ESE pago,
    // nunca por un aviso viejo de un intento anterior.
    if (!REVERSIONES.has(status) || previo.paymentId !== mpPaymentId) return
    await prisma.payment.update({ where: { id: paymentDbId }, data: { status } })
    void enviarAvisoTrainer(`${status === 'refunded' ? 'Devolución' : 'Contracargo'}: ${previo.user.nombre}`, [
      `El pago de ${previo.user.nombre} (${previo.user.email}) pasó a "${status}" en Mercado Pago.`,
      `Plan: ${PLAN_LABELS[previo.planTipo] ?? previo.planTipo}. Monto: $${previo.amount.toLocaleString('es-AR')}.`,
      'El plan no se tocó: revisalo a mano.',
    ])
    return
  }

  if (previo.paymentId === mpPaymentId && previo.status === status) return
  await prisma.payment.update({
    where: { id: paymentDbId },
    data:  { paymentId: mpPaymentId, status },
  })
}
