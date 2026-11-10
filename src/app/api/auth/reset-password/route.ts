// Verifica el código y actualiza la contraseña

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { DEMASIADOS_INTENTOS, ipDe, permitirIntento } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    const { email: emailCrudo, codigo, nuevaPassword } = await request.json()

    if (typeof emailCrudo !== 'string' || typeof codigo !== 'string' || typeof nuevaPassword !== 'string'
      || !emailCrudo || !codigo || !nuevaPassword) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 })
    }
    if (nuevaPassword.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 })
    }
    const email = emailCrudo.trim()

    // El código tiene 6 dígitos: sin límite se adivina por fuerza bruta en
    // minutos. 5 intentos por cuenta cada 15 minutos, que es lo que dura el
    // código, y 30 por IP.
    const permitido =
      await permitirIntento(`reset-ip:${ipDe(request)}`, 30, 15 * 60) &&
      await permitirIntento(`reset:${email.toLowerCase()}`, 5, 15 * 60)

    const usuario = await prisma.user.findUnique({ where: { email } })

    if (!permitido) {
      // Se quema el código vigente: hay que pedir uno nuevo.
      if (usuario) {
        await prisma.resetToken.updateMany({ where: { userId: usuario.id, usado: false }, data: { usado: true } })
      }
      return NextResponse.json({ error: `${DEMASIADOS_INTENTOS} Vas a tener que pedir un código nuevo.` }, { status: 429 })
    }

    if (!usuario) {
      return NextResponse.json({ error: 'El código es inválido o ya expiró.' }, { status: 400 })
    }

    // Buscar el código válido más reciente
    const token = await prisma.resetToken.findFirst({
      where: {
        userId: usuario.id,
        codigo: codigo.trim(),
        usado:  false,
        expiresAt: { gt: new Date() }, // no expirado
      },
      orderBy: { creadoEn: 'desc' },
    })

    if (!token) {
      return NextResponse.json({ error: 'El código es inválido o ya expiró.' }, { status: 400 })
    }

    // Marcar token como usado y actualizar contraseña en paralelo
    const passwordHash = await bcrypt.hash(nuevaPassword, 10)
    await Promise.all([
      prisma.resetToken.update({ where: { id: token.id }, data: { usado: true } }),
      prisma.user.update({ where: { id: usuario.id }, data: { password: passwordHash } }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[RESET-PASSWORD]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
