// Genera un código de 6 dígitos y lo envía al email del usuario

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarCodigoRecuperacion } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email requerido.' }, { status: 400 })

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
    const codigo = String(Math.floor(100000 + Math.random() * 900000))
    console.log(`[RECUPERAR] Código generado (solo visible en logs del server): ${codigo}`)

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
