// GET /api/test/mp — verifica conectividad con Mercado Pago
// Ruta temporal de diagnóstico. Protegida por ADMIN_EMAILS.
// Eliminar en producción cuando ya no sea necesaria.

import { NextResponse } from 'next/server'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { obtenerTokenDeRequest, verificarToken, esAdmin } from '@/lib/auth'

export async function GET(request: Request) {
  // Solo admins pueden ejecutar el test
  const token = obtenerTokenDeRequest(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const payload = verificarToken(token)
  if (!payload || !esAdmin(payload.email)) {
    return NextResponse.json({ error: 'Solo admins' }, { status: 403 })
  }

  const accessToken = process.env.MP_ACCESS_TOKEN
  const publicKey   = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? process.env.MP_PUBLIC_KEY

  const credenciales = {
    accessToken: accessToken
      ? `${accessToken.slice(0, 20)}... (${accessToken.startsWith('TEST-') ? 'TEST ✅' : 'PRODUCCIÓN 🚨'})`
      : '❌ NO CONFIGURADO',
    publicKey: publicKey
      ? `${publicKey.slice(0, 20)}... (${publicKey.startsWith('TEST-') ? 'TEST ✅' : 'PRODUCCIÓN 🚨'})`
      : '❌ NO CONFIGURADO',
  }

  if (!accessToken) {
    return NextResponse.json({
      ok: false,
      error: 'MP_ACCESS_TOKEN no configurado en las env vars',
      credenciales,
    }, { status: 500 })
  }

  try {
    const mp         = new MercadoPagoConfig({ accessToken })
    const preference = new Preference(mp)

    const result = await preference.create({
      body: {
        items: [{
          id:          'test-ping',
          title:       'REVIVA · Test de conectividad',
          description: 'Preferencia de prueba — eliminar si aparece en MP dashboard',
          quantity:    1,
          unit_price:  1,
          currency_id: 'ARS',
        }],
        payer: { name: 'Test REVIVA', email: 'test@reviva.com' },
      },
    })

    return NextResponse.json({
      ok: true,
      mensaje: 'Conexión con Mercado Pago exitosa ✅',
      credenciales,
      preferencia: {
        id:             result.id,
        sandbox_url:    result.sandbox_init_point,
        live_url:       result.init_point,
      },
    })
  } catch (err: unknown) {
    const e = err as Error & { cause?: unknown }
    console.error('[TEST MP]', e)
    return NextResponse.json({
      ok: false,
      error: e.message,
      causa: e.cause,
      credenciales,
    }, { status: 500 })
  }
}
