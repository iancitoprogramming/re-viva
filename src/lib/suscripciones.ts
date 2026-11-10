// Débito automático de Mercado Pago (preapproval) registrado en el sistema.
//
// Antes se ofrecían links mpago.la: cobraban, pero la web no se enteraba de
// quién pagaba ni de cuándo alguien se daba de baja. Ahora la suscripción se
// crea por API con external_reference = id de Suscripcion, y el webhook:
//   · registra cada cobro mensual y corre el vencimiento del plan,
//   · avisa al trainer si un cobro falla o si el cliente cancela.

import { prisma } from '@/lib/prisma'
import { PLAN_LABELS } from '@/lib/constants'
import { nuevoVencimiento } from '@/lib/periodoSuscripcion'
import { enviarAvisoTrainer, enviarNotificacionPagoAprobado } from '@/lib/email'

type SuscripcionConUsuario = NonNullable<Awaited<ReturnType<typeof buscarSuscripcion>>>

export function buscarSuscripcion(referencia?: string | null, preapprovalId?: string | null) {
  const condiciones = [
    ...(referencia ? [{ id: referencia }] : []),
    ...(preapprovalId ? [{ preapprovalId }] : []),
  ]
  if (condiciones.length === 0) return Promise.resolve(null)
  return prisma.suscripcion.findFirst({
    where: { OR: condiciones },
    include: { user: { select: { nombre: true, email: true } } },
  })
}

// Un cobro de la suscripción (el primero o cualquier renovación). Idempotente:
// MP puede avisar varias veces del mismo pago.
export async function registrarCobroSuscripcion(
  suscripcion: SuscripcionConUsuario,
  mpPaymentId: string,
  status: string,
  monto: number,
): Promise<void> {
  const previo = await prisma.payment.findFirst({ where: { paymentId: mpPaymentId } })
  if (previo?.status === status) return
  const yaEstabaAprobado = previo?.status === 'approved'

  if (previo) {
    await prisma.payment.update({ where: { id: previo.id }, data: { status } })
  } else {
    await prisma.payment.create({
      data: {
        userId: suscripcion.userId,
        planTipo: suscripcion.planTipo,
        preferenceId: `suscripcion:${suscripcion.id}`,
        paymentId: mpPaymentId,
        status,
        amount: monto,
      },
    })
  }

  const etiqueta = PLAN_LABELS[suscripcion.planTipo] ?? suscripcion.planTipo

  if (status === 'approved' && !yaEstabaAprobado) {
    await prisma.suscripcion.update({
      where: { id: suscripcion.id },
      data:  { estado: 'authorized', ultimoCobroEn: new Date() },
    })

    const plan = await prisma.nutritionalPlan.findUnique({ where: { userId: suscripcion.userId } })
    if (plan?.estado === 'ACTIVO') {
      // Renovación: el plan sigue sin que nadie toque nada.
      await prisma.nutritionalPlan.update({
        where: { id: plan.id },
        data: {
          tipoPlan: suscripcion.planTipo,
          fechaVencimiento: nuevoVencimiento(plan.fechaVencimiento, suscripcion.planTipo),
        },
      })
    } else if (plan && !plan.tipoPlan) {
      // Primer cobro de un cliente nuevo: el vencimiento lo fija el trainer al activar.
      await prisma.nutritionalPlan.update({ where: { id: plan.id }, data: { tipoPlan: suscripcion.planTipo } })
    }

    void enviarNotificacionPagoAprobado(suscripcion.user.nombre, suscripcion.user.email, suscripcion.planTipo, monto)
    return
  }

  if (status === 'rejected') {
    void enviarAvisoTrainer(`Cobro rechazado: ${suscripcion.user.nombre}`, [
      `El débito automático de ${suscripcion.user.nombre} (${suscripcion.user.email}) fue rechazado.`,
      `Plan: ${etiqueta}. Monto: $${monto.toLocaleString('es-AR')}.`,
      'Mercado Pago reintenta solo durante unos días. Si no entra, la suscripción se cancela: conviene escribirle ahora.',
    ])
  }
}

// Cambio de estado de la suscripción en MP (autorizada, pausada, cancelada).
export async function actualizarEstadoSuscripcion(
  suscripcion: SuscripcionConUsuario,
  datos: { preapprovalId: string; estado: string; proximoCobro?: string | null },
): Promise<void> {
  const proximo = datos.proximoCobro ? new Date(datos.proximoCobro) : null
  await prisma.suscripcion.update({
    where: { id: suscripcion.id },
    data: {
      preapprovalId: datos.preapprovalId,
      estado: datos.estado,
      proximoCobro: proximo && !Number.isNaN(proximo.getTime()) ? proximo : undefined,
    },
  })

  const seFue = (datos.estado === 'cancelled' || datos.estado === 'paused') && suscripcion.estado === 'authorized'
  if (seFue) {
    void enviarAvisoTrainer(
      `${datos.estado === 'cancelled' ? 'Baja' : 'Pausa'} de débito automático: ${suscripcion.user.nombre}`,
      [
        `${suscripcion.user.nombre} (${suscripcion.user.email}) ${datos.estado === 'cancelled' ? 'canceló' : 'pausó'} el débito automático.`,
        `Plan: ${PLAN_LABELS[suscripcion.planTipo] ?? suscripcion.planTipo}.`,
        'El plan sigue activo hasta su vencimiento. Es el momento de escribirle.',
      ],
    )
  }
}
