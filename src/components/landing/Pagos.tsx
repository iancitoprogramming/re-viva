'use client'

import { useState } from 'react'
import { ALIAS, WHATSAPP_COMPROBANTE } from '@/lib/constants'

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'
const IVORY40 = 'rgba(245,242,231,0.40)'
const GLASS   = 'rgba(255,255,255,0.035)'
const BORDER  = 'rgba(201,168,76,0.13)'

function CopiarAliasInline() {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(ALIAS)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // fallback silencioso
    }
  }

  return (
    <div
      className="rounded-2xl p-4 flex items-center justify-between mt-4"
      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}` }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-0.5"
           style={{ color: IVORY40 }}>
          Alias
        </p>
        <p className="font-mono font-bold text-lg tracking-wide"
           style={{ color: IVORY }}>
          {ALIAS}
        </p>
      </div>
      <button
        onClick={copiar}
        className="px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-[0.98]"
        style={copiado
          ? { background: '#1B3D2F', color: GOLD, border: `1px solid rgba(201,168,76,0.30)` }
          : { background: 'rgba(201,168,76,0.12)', color: GOLD, border: `1px solid rgba(201,168,76,0.25)` }
        }
      >
        {copiado ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

export default function Pagos() {
  return (
    <section
      className="px-6 py-20"
      id="pagos"
      style={{
        background:
          'radial-gradient(ellipse at 15% 80%, rgba(27,61,47,0.10) 0%, transparent 50%), #0a0a08',
      }}
    >
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3"
             style={{ color: GOLD }}>
            Medios de pago
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl mb-3"
              style={{ color: IVORY }}>
            Empezar es simple.
          </h2>
          <p className="text-base max-w-sm mx-auto"
             style={{ color: IVORY60 }}>
            Elegís cómo pagar. Confirmamos el pago y activamos tu proceso en 24–72 hs hábiles.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">

          {/* Transferencia bancaria */}
          <div
            className="rounded-2xl p-6"
            style={{ background: GLASS, border: `1px solid ${BORDER}`, backdropFilter: 'blur(14px)' }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,168,76,0.12)', border: `1px solid rgba(201,168,76,0.20)` }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={GOLD}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: IVORY }}>Transferencia bancaria</p>
                <p className="text-xs" style={{ color: IVORY40 }}>CBU / Alias · Lemon · cualquier banco</p>
              </div>
            </div>
            <CopiarAliasInline />
            <a
              href={WHATSAPP_COMPROBANTE}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{ background: '#25D366' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Enviar comprobante
            </a>
          </div>

          {/* Mercado Pago */}
          <div
            className="rounded-2xl p-6"
            style={{ background: GLASS, border: `1px solid ${BORDER}`, backdropFilter: 'blur(14px)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,158,227,0.12)', border: '1px solid rgba(0,158,227,0.20)' }}
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48" fill="#009EE3">
                  <path d="M44 24c0 11.05-8.95 20-20 20S4 35.05 4 24 12.95 4 24 4s20 8.95 20 20z" opacity=".3"/>
                  <path d="M34.1 17.5H13.9c-1.6 0-2.9 1.3-2.9 2.9v7.2c0 1.6 1.3 2.9 2.9 2.9h4.6l1.5 2.6c.3.5 1 .5 1.3 0l1.5-2.6h11.3c1.6 0 2.9-1.3 2.9-2.9v-7.2c0-1.6-1.3-2.9-2.9-2.9z"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: IVORY }}>Mercado Pago</p>
                <p className="text-xs" style={{ color: IVORY40 }}>Débito, crédito o saldo MP</p>
              </div>
            </div>
            <p className="text-xs leading-relaxed mb-4" style={{ color: IVORY60 }}>
              Pagás online de forma segura. El pago se acredita automáticamente y activamos tu plan.
            </p>
            <a
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 text-white py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
              style={{ background: '#009EE3' }}
            >
              Pagar con Mercado Pago →
            </a>
          </div>

        </div>

        <p className="text-xs text-center mt-6" style={{ color: IVORY40 }}>
          Tu plan queda activo dentro de las 24 a 72 horas hábiles de confirmado el pago.
        </p>
      </div>
    </section>
  )
}
