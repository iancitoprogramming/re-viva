import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { crearToken, esAdmin } from '@/lib/auth'
import { DEMASIADOS_INTENTOS, ipDe, limpiarIntentos, permitirIntento } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    const { email: emailCrudo, password } = await request.json()

    if (typeof emailCrudo !== 'string' || typeof password !== 'string' || !emailCrudo || !password) {
      return NextResponse.json({ error: 'Email y contraseña son obligatorios.' }, { status: 400 })
    }
    const email = emailCrudo.trim()

    // 20 intentos por IP y 8 por IP + cuenta cada 15 minutos. El límite por
    // cuenta va atado a la IP para que nadie pueda bloquearle el login a otro.
    const ip = ipDe(request)
    const claveCuenta = `login:${ip}:${email.toLowerCase()}`
    const permitido =
      await permitirIntento(`login:${ip}`, 20, 15 * 60) &&
      await permitirIntento(claveCuenta, 8, 15 * 60)
    if (!permitido) return NextResponse.json({ error: DEMASIADOS_INTENTOS }, { status: 429 })

    const usuario = await prisma.user.findUnique({
      where: { email },
      include: { perfil: true, plan: true },
    })

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return NextResponse.json({ error: 'Email o contraseña incorrectos.' }, { status: 401 })
    }

    void limpiarIntentos(claveCuenta)

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
    const e = error as Error
    console.error('[LOGIN] Error:', e?.message, e?.stack)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
