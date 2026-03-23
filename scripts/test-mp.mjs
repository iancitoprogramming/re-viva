// Verifica la conectividad con la API de Mercado Pago
// Uso: node --experimental-require-module scripts/test-mp.mjs  (desde raíz del proyecto)

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require   = createRequire(import.meta.url)

// Cargar .env desde la raíz del proyecto
const dotenv = require(path.join(__dirname, '../node_modules/dotenv'))
dotenv.config({ path: path.join(__dirname, '../.env') })

const { MercadoPagoConfig, Preference } = require(path.join(__dirname, '../node_modules/mercadopago'))

const token     = process.env.MP_ACCESS_TOKEN
const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? process.env.MP_PUBLIC_KEY

console.log('\n══════════════════════════════════════════')
console.log('   REVIVA · Test de Mercado Pago')
console.log('══════════════════════════════════════════\n')

console.log('🔑 Credenciales configuradas:')
console.log('  ACCESS_TOKEN:', token     ? `${token.slice(0, 22)}... (${token.startsWith('TEST-') ? '✅ TEST' : '🚨 PRODUCCIÓN'})` : '❌ NO CONFIGURADO')
console.log('  PUBLIC_KEY:  ', publicKey ? `${publicKey.slice(0, 22)}... (${publicKey.startsWith('TEST-') ? '✅ TEST' : '🚨 PRODUCCIÓN'})` : '❌ NO CONFIGURADO')

if (!token) {
  console.error('\n❌ MP_ACCESS_TOKEN no está configurado en .env')
  process.exit(1)
}

const mp         = new MercadoPagoConfig({ accessToken: token })
const preference = new Preference(mp)

console.log('\n📡 Creando preferencia de prueba en MP...\n')

try {
  const result = await preference.create({
    body: {
      items: [{
        id:         'test-reviva',
        title:      'Plan Test REVIVA — Verificación',
        description:'Test de conectividad automático',
        quantity:   1,
        unit_price: 100,
        currency_id:'ARS',
      }],
      payer: {
        name:  'Test Usuario',
        email: 'test@reviva.com',
      },
      back_urls: {
        success: 'https://re-viva.vercel.app/checkout/success',
        failure: 'https://re-viva.vercel.app/checkout/failure',
        pending: 'https://re-viva.vercel.app/checkout/pending',
      },
      auto_return: 'approved',
    },
  })

  console.log('✅ CONEXIÓN CON MERCADO PAGO: OK\n')
  console.log('  Preference ID:      ', result.id)
  console.log('  Sandbox init_point: ', result.sandbox_init_point)
  console.log('  Live init_point:    ', result.init_point)
  console.log('\n══════════════════════════════════════════')
  console.log('✅ Todo está correctamente configurado.')
  console.log('══════════════════════════════════════════\n')

} catch (err) {
  console.error('❌ ERROR AL CONECTAR CON MERCADO PAGO:\n')
  console.error('  Mensaje:', err?.message)
  if (err?.cause) console.error('  Causa:  ', JSON.stringify(err.cause, null, 2))
  console.error('\n══════════════════════════════════════════')
  console.error('Revisá que MP_ACCESS_TOKEN sea correcto y esté activo en tu cuenta de MP.')
  console.error('══════════════════════════════════════════\n')
  process.exit(1)
}
