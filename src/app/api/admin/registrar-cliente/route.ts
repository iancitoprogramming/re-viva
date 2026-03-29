import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'
import { enviarCredencialesCliente } from '@/lib/email'

export async function POST(request: Request) {
  try {
    // — Auth admin
    const rawToken = obtenerTokenDeRequest(request)
    if (!rawToken) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    const payload = verificarToken(rawToken)
    if (!payload || !esAdmin(payload.email)) {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })
    }

    const { nombre, email, password, notas } = await request.json()

    if (!nombre?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios.' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 })
    }

    const existe = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (existe) {
      return NextResponse.json({ error: 'Ya existe un cliente con ese email.' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const usuario = await prisma.user.create({
      data: {
        nombre:   nombre.trim(),
        email:    email.trim().toLowerCase(),
        password: passwordHash,
      },
    })

    // Si hay notas, crear plan PENDIENTE directamente con esa información
    if (notas?.trim()) {
      await prisma.nutritionalPlan.create({
        data: {
          userId:       usuario.id,
          estado:       'PENDIENTE',
          notasTrainer: notas.trim(),
        },
      })
    }

    // Enviar credenciales por email (async, no bloquea)
    enviarCredencialesCliente(usuario.nombre, usuario.email, password).catch(() => {})

    return NextResponse.json({ ok: true, userId: usuario.id })

  } catch (error) {
    console.error('[REGISTRAR-CLIENTE]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
