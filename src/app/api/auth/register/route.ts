import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { crearToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { nombre, email, password } = await request.json()

    if (!nombre || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 })
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
