// Genera un código de 6 dígitos y lo envía al email del usuario

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarCodigoRecuperacion } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email requerido.' }, { status: 400 })

    // Buscamos el usuario — si no existe, respondemos igual para no filtrar información
    const usuario = await prisma.user.findUnique({ where: { email } })
    if (!usuario) {
      return NextResponse.json({ ok: true }) // respuesta genérica por seguridad
    }

    // Invalidar códigos previos del mismo usuario
    await prisma.resetToken.updateMany({
      where: { userId: usuario.id, usado: false },
      data:  { usado: true },
    })

    // Generar código de 6 dígitos
    const codigo = String(Math.floor(100000 + Math.random() * 900000))

    // Guardar en DB con expiración de 15 minutos
    await prisma.resetToken.create({
      data: {
        userId:    usuario.id,
        codigo,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    })

    // Enviar email
    await enviarCodigoRecuperacion(usuario.nombre, email, codigo)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[RECUPERAR]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
