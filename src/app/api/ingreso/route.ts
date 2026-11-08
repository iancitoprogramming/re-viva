// POST /api/ingreso — alta pública desde el formulario /ingreso.
//
// La validación del cliente es comodidad, no control: acá se repite íntegra
// antes de insertar. Un POST armado a mano con campos críticos vacíos se
// rechaza con 400.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enviarNotificacionAlta } from '@/lib/email'
import { construirFicha, type AltaFicha } from '@/lib/ficha'
import { normalizarIngreso, parsearForm, validarIngreso } from '@/lib/ingreso'

// ─── Rate limit por IP: cinco envíos por hora ────────────────────────────────
// Contador en memoria del proceso. En serverless cada instancia tiene el suyo,
// así que es un freno contra el spam tonto, no una garantía. Alcanza para lo
// que se busca acá: no hay captcha y el formulario es público.

const VENTANA_MS = 60 * 60 * 1000
const MAX_ENVIOS = 5
const envios = new Map<string, number[]>()

function ipDe(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') ?? 'desconocida'
}

function excedido(ip: string): boolean {
  const ahora = Date.now()
  const previos = (envios.get(ip) ?? []).filter(t => ahora - t < VENTANA_MS)
  if (previos.length >= MAX_ENVIOS) {
    envios.set(ip, previos)
    return true
  }
  previos.push(ahora)
  envios.set(ip, previos)
  // Limpieza barata para que el Map no crezca sin techo.
  if (envios.size > 500) {
    for (const [k, v] of envios) {
      if (!v.some(t => ahora - t < VENTANA_MS)) envios.delete(k)
    }
  }
  return false
}

export async function POST(request: Request) {
  const ip = ipDe(request)
  if (excedido(ip)) {
    return NextResponse.json(
      { error: 'Demasiados envíos. Probá de nuevo en un rato.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
  }

  const form = parsearForm(body)

  // Honeypot: si vino completo es un bot. 200 y no se guarda nada.
  if ((form.apodo ?? '').trim() !== '') {
    console.warn(`[INGRESO] Honeypot completado — descartado (ip ${ip})`)
    return NextResponse.json({ ok: true })
  }

  const errores = validarIngreso(form)
  if (Object.keys(errores).length) {
    return NextResponse.json({ error: 'Faltan datos.', errores }, { status: 400 })
  }

  // Redundante con la validación, pero el consentimiento se chequea aparte:
  // sin autorización no se guarda un dato de salud.
  if (form.consentimiento !== true) {
    return NextResponse.json(
      { error: 'Falta la autorización para usar los datos.', errores: { consentimiento: 'Necesito tu autorización para seguir' } },
      { status: 400 },
    )
  }

  const datos = normalizarIngreso(form)

  let alta
  try {
    alta = await prisma.alta.create({ data: datos })
  } catch (err) {
    console.error('[INGRESO] Error insertando el alta:', (err as Error).message)
    return NextResponse.json({ error: 'No se pudo guardar el alta.' }, { status: 500 })
  }

  // El alta ya está guardada. Si el mail falla, se loguea y se devuelve 200
  // igual: nunca perder un alta por un problema de mail.
  try {
    const ficha = construirFicha({
      ...alta,
      pesoKg: Number(alta.pesoKg),
      horariosEntrenamiento: alta.horariosEntrenamiento as Record<string, string>,
      horariosComidas: alta.horariosComidas as Record<string, string | null>,
    } as AltaFicha)
    await enviarNotificacionAlta(alta.nombre, alta.id, ficha.prompt, ficha.alertas)
  } catch (err) {
    console.error(`[INGRESO] Alta ${alta.id} guardada pero el mail falló:`, (err as Error).message)
  }

  return NextResponse.json({ ok: true, id: alta.id })
}
