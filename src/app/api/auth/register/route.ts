import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { crearToken } from '@/lib/auth'
import { DEMASIADOS_INTENTOS, ipDe, permitirIntento } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    const { nombre, email, password } = await request.json()

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    }

    // 10 cuentas por IP por hora: frena altas automáticas sin molestar a nadie real.
    if (!(await permitirIntento(`registro:${ipDe(request)}`, 10, 60 * 60))) {
      return NextResponse.json({ error: DEMASIADOS_INTENTOS }, { status: 429 })
    }

    // Verificar si el email ya está registrado
    const existe = await prisma.user.findUnique({ where: { email } })
    if (existe) {
      return NextResponse.json({ error: 'Este email ya está registrado.' }, { status: 400 })
    }

    // Encriptar contraseña y crear usuario
    const passwordHash = await bcrypt.hash(password, 10)
    const usuario = await prisma.user.create({
      data: { nombre, email, password: passwordHash },
    })

    const token = crearToken({ userId: usuario.id, email: usuario.email, nombre: usuario.nombre })

    const response = NextResponse.json({ ok: true, tienePerfil: false })
    response.cookies.set('re-viva-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
    })
    return response

  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
