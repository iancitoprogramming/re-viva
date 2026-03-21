import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { crearToken, esAdmin } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios.' }, { status: 400 })
    }

    const usuario = await prisma.user.findUnique({
      where: { email },
      include: { perfil: true, plan: true },
    })

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos.' }, { status: 401 })
    }

    const token = crearToken({ userId: usuario.id, email: usuario.email, nombre: usuario.nombre })

    const response = NextResponse.json({
      ok: true,
      tienePerfil: !!usuario.perfil,
      esAdmin: esAdmin(usuario.email),
      planEstado: usuario.plan?.estado ?? null,
    })
    response.cookies.set('re-viva-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response

  } catch (error) {
    console.error('[LOGIN]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
