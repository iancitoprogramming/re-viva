// GET /api/onboarding/prefill
// Si la persona ya completó /ingreso con el mismo mail, devuelve los datos de
// ese formulario que coinciden exactamente con el cuestionario, para no
// hacérselos cargar dos veces. Lo que en /ingreso es texto libre (objetivo,
// sueño) y los consentimientos legales NO se infieren: se vuelven a pedir.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken } from '@/lib/auth'

const DOMINGO: Record<string, string> = { 'Sí, entero': 'siempre', 'Un rato': 'aveces', 'No': 'no' }
const ESTRES: Record<string, string> = { Bajo: 'BAJO', Medio: 'MEDIO', Alto: 'ALTO' }

export async function GET(request: Request) {
  const token = obtenerTokenDeRequest(request)
  const payload = token ? verificarToken(token) : null
  if (!payload) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  try {
    const alta = await prisma.alta.findFirst({
      where: { email: { equals: payload.email, mode: 'insensitive' } },
      orderBy: { creadoEn: 'desc' },
    })
    if (!alta) return NextResponse.json({ prefill: null })

    const dias = alta.diasEntrenamiento.length
    return NextResponse.json({
      prefill: {
        genero: alta.sexo === 'Femenino' ? 'FEMENINO' : alta.sexo === 'Masculino' ? 'MASCULINO' : '',
        edad: String(alta.edad),
        altura: String(alta.alturaCm),
        peso: String(Number(alta.pesoKg)),
        diasEntrenamiento: dias >= 1 && dias <= 7 ? String(dias) : '',
        nivelEstres: (alta.estres && ESTRES[alta.estres]) ?? '',
        disponibilidadDomingo: (alta.domingo && DOMINGO[alta.domingo]) ?? 'no',
        resultadoSonado: alta.objetivo,
      },
    })
  } catch (error) {
    console.error('[onboarding/prefill]', error)
    return NextResponse.json({ prefill: null })
  }
}
