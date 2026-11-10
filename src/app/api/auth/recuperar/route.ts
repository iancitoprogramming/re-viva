// Genera un código de 6 dígitos y lo envía al email del usuario

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomInt } from 'crypto'
import { enviarCodigoRecuperacion } from '@/lib/email'
import { ipDe, permitirIntento } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (typeof email !== 'string' || !email) return NextResponse.json({ error: 'Email requerido.' }, { status: 400 })

    // 3 códigos por cuenta y 10 por IP por hora. Si se pasa, se responde igual
    // que siempre: no se revela nada y no se manda otro mail.
    const permitido =
      await permitirIntento(`recuperar-ip:${ipDe(request)}`, 10, 60 * 60) &&
      await permitirIntento(`recuperar:${email.trim().toLowerCase()}`, 3, 60 * 60)
    if (!permitido) {
      console.warn('[RECUPERAR] Límite de pedidos alcanzado.')
      return NextResponse.json({ ok: true })
    }

    console.log(`[RECUPERAR] Solicitud para: ${email}`)
    console.log(`[RECUPERAR] Resend: ${process.env.RESEND_API_KEY ? '✅ API key presente' : '❌ falta RESEND_API_KEY'} · from: ${process.env.RESEND_FROM_EMAIL ?? '(default noreply@revivabyigz.com)'}`)

    // Buscamos el usuario — si no existe, respondemos igual para no filtrar información
    const usuario = await prisma.user.findUnique({ where: { email } })
    if (!usuario) {
      console.log(`[RECUPERAR] Email no encontrado en DB, respuesta genérica.`)
      return NextResponse.json({ ok: true }) // respuesta genérica por seguridad
    }

    console.log(`[RECUPERAR] Usuario encontrado: ${usuario.nombre} (${usuario.id})`)

    // Invalidar códigos previos del mismo usuario
    await prisma.resetToken.updateMany({
      where: { userId: usuario.id, usado: false },
      data:  { usado: true },
    })

    // Generar código de 6 dígitos
    const codigo = String(randomInt(100000, 1000000))

    // Guardar en DB con expiración de 15 minutos
    await prisma.resetToken.create({
      data: {
        userId:    usuario.id,
        codigo,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    console.log(`[RECUPERAR] Token guardado en DB. Enviando email...`)

    // Enviar email — si falla, el código sigue en DB (el usuario puede reintentar)
    const emailResult = await enviarCodigoRecuperacion(usuario.nombre, email, codigo)

    if (!emailResult.ok) {
      console.error(`[RECUPERAR] ❌ Error al enviar email: ${emailResult.error}`)
      // Igual retornamos ok:true por seguridad (no revelamos si el email existe)
      // El código está en DB — si el usuario no recibe nada, puede reintentar
      // Para depurar: revisar los logs de Vercel con el error de arriba
    } else {
      console.log(`[RECUPERAR] ✅ Email enviado correctamente`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[RECUPERAR] Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
