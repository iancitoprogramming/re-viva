import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import { correrMotorIGZ } from '@/lib/igzEngine'
import { enviarNotificacionNuevoCliente } from '@/lib/email'
import type { OnboardingData } from '@/types'

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const token = obtenerTokenDeRequest(request)
    if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    const payload = verificarToken(token)
    if (!payload) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 })

    const body = await request.json() as OnboardingData

    // Validaciones básicas
    const campos = ['genero', 'edad', 'altura', 'peso', 'objetivo', 'diasEntrenamiento', 'nivelEstres', 'horasSueno', 'adherencia']
    for (const campo of campos) {
      if (body[campo as keyof OnboardingData] === undefined || body[campo as keyof OnboardingData] === '') {
        return NextResponse.json({ error: `El campo "${campo}" es obligatorio.` }, { status: 400 })
      }
    }

    // Verificar que no tenga perfil ya
    const perfilExistente = await prisma.nutritionalProfile.findUnique({ where: { userId: payload.userId } })
    if (perfilExistente) {
      return NextResponse.json({ error: 'Ya completaste el formulario anteriormente.' }, { status: 400 })
    }

    // Guardar perfil en la base de datos
    await prisma.nutritionalProfile.create({
      data: {
        userId:            payload.userId,
        genero:            body.genero,
        edad:              body.edad,
        altura:            body.altura,
        peso:              body.peso,
        objetivo:          body.objetivo,
        diasEntrenamiento: body.diasEntrenamiento,
        nivelEstres:       body.nivelEstres,
        horasSueno:        body.horasSueno,
        adherencia:        body.adherencia,
        preferenciasAlimentarias: body.preferenciasAlimentarias,
        lesiones:          body.lesiones,
        fechaNacimiento:   body.fechaNacimiento ? new Date(body.fechaNacimiento) : null,
      },
    })

    // Correr motor IGZ
    const igz = correrMotorIGZ(body)

    // Crear el plan en estado PENDIENTE con el pre-cálculo IGZ
    await prisma.nutritionalPlan.create({
      data: {
        userId:          payload.userId,
        estado:          'PENDIENTE',
        igzClasificacion: igz.clasificacion,
        igzCalorias:     igz.calorias,
        igzProteina:     igz.proteina,
        igzHidratos:     igz.hidratos,
        igzGrasas:       igz.grasas,
      },
    })

    // Enviar email al trainer (no bloqueamos si falla)
    try {
      await enviarNotificacionNuevoCliente(payload.nombre, payload.email, body, igz)
    } catch (emailError) {
      console.error('[ONBOARDING] Error enviando email:', emailError)
    }

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error('[ONBOARDING]', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
