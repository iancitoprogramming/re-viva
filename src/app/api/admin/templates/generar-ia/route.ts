// POST /api/admin/templates/generar-ia
//
// Llama a Gemini para generar un template de plan alimentario basado en
// los parámetros del cliente (objetivo, género, kcal target, etc.).
// Guarda el template generado en la DB con generadoConIA: true.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

function adminGuard(request: Request) {
  const token = obtenerTokenDeRequest(request)
  if (!token) return null
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) return null
  return payload
}

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export async function POST(request: Request) {
  if (!adminGuard(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY no configurada.' }, { status: 500 })

  const body = await request.json()
  const {
    nombre,
    genero,       // "MASCULINO" | "FEMENINO"
    objetivo,     // "VOLUMEN" | "DEFINICION" | "RECOMPOSICION"
    edad,
    kcalTarget,
    proteinaTarget,
    hidratosTarget,
    grasasTarget,
    adherencia,   // "BAJA" | "MEDIA" | "ALTA"
    restricciones, // string libre, ej: "sin gluten, sin lactosa"
    guardar,       // boolean — si true guarda en DB, si false solo devuelve el JSON
  } = body

  if (!kcalTarget || !proteinaTarget || !hidratosTarget || !grasasTarget) {
    return NextResponse.json({ error: 'Faltan macros target.' }, { status: 400 })
  }

  // Cargar catálogo de alimentos para que Gemini elija solo de los disponibles
  const foods = await prisma.food.findMany({ where: { activo: true }, orderBy: { categoria: 'asc' } })
  const catalogoTexto = foods.map(f =>
    `- ${f.nombre} (${f.categoria}): ${f.kcal} kcal, ${f.proteina}g prot, ${f.hidratos}g HC, ${f.grasas}g grasa por 100${f.unidad}`
  ).join('\n')

  const prompt = `Sos un nutricionista deportivo experto. Creá un plan alimentario diario completo para:
- Género: ${genero || 'no especificado'}
- Objetivo: ${objetivo || 'no especificado'}
- Edad: ${edad || 'no especificada'}
- Calorías target: ${kcalTarget} kcal
- Proteína target: ${proteinaTarget}g
- Hidratos target: ${hidratosTarget}g
- Grasas target: ${grasasTarget}g
- Adherencia: ${adherencia || 'MEDIA'}
- Restricciones: ${restricciones || 'ninguna'}

REGLAS IMPORTANTES:
1. Usá ÚNICAMENTE alimentos de este catálogo (usá el nombre exacto):
${catalogoTexto}

2. El plan debe tener entre 4 y 6 comidas (desayuno, almuerzo, merienda, cena y opcionales colación/media mañana).
3. Los macros totales del plan deben estar dentro del ±5% del target.
4. Los gramos de cada alimento deben ser números enteros razonables (no menos de 20g, no más de 400g por item).
5. Respondé ÚNICAMENTE con un JSON válido, sin texto adicional, sin markdown, sin explicaciones.

Formato exacto del JSON:
{
  "nombre": "nombre descriptivo del template",
  "descripcion": "descripción breve del perfil objetivo",
  "kcalTotal": número,
  "proteinaTotal": número,
  "hidratosTotal": número,
  "grasasTotal": número,
  "comidas": [
    {
      "nombre": "Desayuno",
      "orden": 0,
      "horaSugerida": "08:00",
      "items": [
        { "food": "nombre exacto del alimento del catálogo", "gramos": número },
        ...
      ]
    },
    ...
  ]
}`

  // Llamar a Gemini
  const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 4096,
      },
    }),
  })

  if (!geminiRes.ok) {
    const err = await geminiRes.text()
    console.error('Gemini error:', err)
    return NextResponse.json({ error: 'Error al llamar a Gemini.' }, { status: 502 })
  }

  const geminiData = await geminiRes.json()
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Parsear JSON de la respuesta (Gemini a veces agrega backticks)
  let templateData
  try {
    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    templateData = JSON.parse(cleaned)
  } catch {
    console.error('Gemini raw response:', rawText)
    return NextResponse.json({ error: 'Gemini no devolvió JSON válido.', raw: rawText }, { status: 502 })
  }

  // Si no se pide guardar, devolver solo el JSON para previsualizar
  if (!guardar) {
    return NextResponse.json({ template: templateData, guardado: false })
  }

  // Guardar en DB
  const foodMap = new Map(foods.map(f => [f.nombre, f]))

  const template = await prisma.mealPlanTemplate.create({
    data: {
      nombre: nombre || templateData.nombre,
      descripcion: templateData.descripcion || null,
      genero: genero || null,
      objetivo: objetivo || null,
      adherencia: adherencia || null,
      kcalTarget: Number(kcalTarget),
      proteinaTarget: Number(proteinaTarget),
      hidratosTarget: Number(hidratosTarget),
      grasasTarget: Number(grasasTarget),
      generadoConIA: true,
      comidas: {
        create: templateData.comidas.map((c: { nombre: string; orden: number; horaSugerida?: string; items: { food: string; gramos: number }[] }) => ({
          nombre: c.nombre,
          orden: c.orden,
          horaSugerida: c.horaSugerida || null,
          items: {
            create: c.items
              .filter((it: { food: string; gramos: number }) => foodMap.has(it.food))
              .map((it: { food: string; gramos: number }) => ({
                foodId: foodMap.get(it.food)!.id,
                gramos: Number(it.gramos),
              })),
          },
        })),
      },
    },
    include: {
      comidas: { include: { items: { include: { food: true } } } },
    },
  })

  return NextResponse.json({ template, guardado: true }, { status: 201 })
}
