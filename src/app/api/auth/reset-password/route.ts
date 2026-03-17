// Verifica el código y actualiza la contraseña

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, codigo, nuevaPassword } = await request.json()

    if (!email || !codigo || !nuevaPassword) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 })
    }
    if (nuevaPassword.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 })
    }

    // Buscar usuario
    const usuario = await prisma.user.findUnique({ where: { email } })
    if (!usuario) {
      return NextResponse.json({ error: 'Código inválido o expirado.' }, { status: 400 })
    }

    // Buscar el código válido más reciente
    const token = await prisma.resetToken.findFirst({
      where: {
        userId: usuario.id,
        codigo,
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
