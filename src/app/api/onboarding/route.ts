import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'
import { correrMotorIGZ } from '@/lib/igzEngine'
import { enviarNotificacionNuevoCliente } from '@/lib/email'
import type { OnboardingData } from '@/types'

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  )
}

// Sanitiza un input que el form puede mandar como string CSV o como string[]
function toStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(s => String(s).trim()).filter(Boolean)
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean)
  return []
}

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

    // Normalización defensiva: la altura debe estar en cm.
    // Si el usuario cargó en metros (1.6 / 1.75 / etc), lo convertimos.
    // Cualquier valor por debajo de 3 se asume en metros.
    if (typeof body.altura === 'number') {
      if (body.altura > 0 && body.altura < 3) {
        body.altura = Math.round(body.altura * 100)
      }
      if (body.altura < 130 || body.altura > 230) {
        return NextResponse.json(
          { error: `Altura fuera de rango (recibido: ${body.altura}cm). Cargala en centímetros, ej: 175.` },
          { status: 400 },
        )
      }
    }

    // Idem para peso: si vino en gramos por error, normalizamos.
    if (typeof body.peso === 'number') {
      if (body.peso > 500) body.peso = body.peso / 1000 // gramos → kg
      if (body.peso < 30 || body.peso > 300) {
        return NextResponse.json(
          { error: `Peso fuera de rango (recibido: ${body.peso}kg). Cargalo en kilos, ej: 70.` },
          { status: 400 },
        )
      }
    }

    // Consentimientos legales: si el cliente no acepta los 4, no bloqueamos.
    // Queda marcado en el back-office como pendiente de charla en persona /
    // videollamada. El trainer marca como revisado después.
    const consentimientos = {
      aceptaTerminosYCondiciones:           body.aceptaTerminosYCondiciones === true,
      aceptaPoliticaPrivacidad:             body.aceptaPoliticaPrivacidad === true,
      aceptaDescargoMedicoYResponsabilidad: body.aceptaDescargoMedicoYResponsabilidad === true,
      confirmaVeracidadDatos:               body.confirmaVeracidadDatos === true,
    }
    const todosAceptados =
      consentimientos.aceptaTerminosYCondiciones &&
      consentimientos.aceptaPoliticaPrivacidad &&
      consentimientos.aceptaDescargoMedicoYResponsabilidad &&
      consentimientos.confirmaVeracidadDatos

    // Verificar que no tenga perfil ya
    const perfilExistente = await prisma.nutritionalProfile.findUnique({ where: { userId: payload.userId } })
    if (perfilExistente) {
      return NextResponse.json({ error: 'Ya completaste el formulario anteriormente.' }, { status: 400 })
    }

    // Normalizar arrays de salud (admite CSV o array)
    const alergias                     = toStringArray(body.alergias)
    const intolerancias                = toStringArray(body.intolerancias)
    const alimentosQueNoConsume        = toStringArray(body.alimentosQueNoConsume)
    const condicionesMedicasDeclaradas = toStringArray(body.condicionesMedicasDeclaradas)
    const lesionesActuales             = toStringArray(body.lesionesActuales)
    const lesionesPasadas              = toStringArray(body.lesionesPasadas)
    const medicacionActual             = toStringArray(body.medicacionActual)
    const flagsEspeciales              = toStringArray(body.flagsEspeciales)

    // Auto-flag por edad
    if (typeof body.edad === 'number' && body.edad >= 65 && !flagsEspeciales.includes('adulto_mayor_65plus')) {
      flagsEspeciales.push('adulto_mayor_65plus')
    }

    const ip = getClientIp(request)

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
        // Campos extendidos
        experiencia:          body.experiencia || null,
        equipamiento:         body.equipamiento ?? [],
        actividadLaboral:     body.actividadLaboral || null,
        practicaDeportes:     body.practicaDeportes ?? false,
        deportes:             body.deportes ?? [],
        quiereMejorarDeporte: body.quiereMejorarDeporte || null,
        metasFisicas:         body.metasFisicas ?? [],
        flagsEspeciales,
        disponibilidadDomingo: body.disponibilidadDomingo ?? 'no',
        // Pipeline de generación automática
        comidasPorDia:        body.comidasPorDia ?? 4,
        minutosPorSesion:     body.minutosPorSesion ?? 60,
        alergias,
        intolerancias,
        alimentosQueNoConsume,
        condicionesMedicasDeclaradas,
        lesionesActuales,
        lesionesPasadas,
        medicacionActual,
        // Consentimientos
        aceptaTerminosYCondiciones:           consentimientos.aceptaTerminosYCondiciones,
        aceptaPoliticaPrivacidad:             consentimientos.aceptaPoliticaPrivacidad,
        aceptaDescargoMedicoYResponsabilidad: consentimientos.aceptaDescargoMedicoYResponsabilidad,
        confirmaVeracidadDatos:               consentimientos.confirmaVeracidadDatos,
        fechaAceptacionConsentimientos:       todosAceptados ? new Date() : null,
        ipAceptacionConsentimientos:          todosAceptados ? ip : null,
        // Si faltó alguno, queda pendiente de revisión personal por el trainer
        consentimientosRevisionPersonal:      todosAceptados, // si todos OK, no requiere revisión
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
