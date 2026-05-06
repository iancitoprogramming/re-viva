// Sección de la landing principal que presenta el curso "Personal Trainer Rentable".
// Audiencia: entrenadores que llegan a la landing, no clientes de coaching.
// Diseño intencionalmente distinto (casi negro + dorado) para marcar el cambio de audiencia.

import Link from 'next/link'
import { PLANES_MP } from '@/lib/constants'

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY70 = 'rgba(245,242,231,0.70)'
const IVORY45 = 'rgba(245,242,231,0.45)'
const IVORY25 = 'rgba(245,242,231,0.25)'

const plan = PLANES_MP['ebook-rentable']
const tieneDescuento = 'montoOriginal' in plan && typeof plan.montoOriginal === 'number' && plan.montoOriginal > plan.monto
const ahorro = tieneDescuento ? (plan.montoOriginal as number) - plan.monto : 0
const pctAhorro = tieneDescuento ? Math.round((ahorro / (plan.montoOriginal as number)) * 100) : 0

const BULLETS = [
  'Cómo salir del modelo hora-cobrada-hora-trabajada',
  'Retención: por qué se van los clientes (y cómo evitarlo)',
  'Modelo de ingresos mixto: presencial, online y digitales',
  'Cuánto cobrar por cada cosa y por qué',
  'Escalar sin clonarte ni quemarte',
]

export default function CursoEntrenadores() {
  return (
    <section
      className="px-6 py-20 relative overflow-hidden"
      style={{ background: '#0a0a08', borderTop: '1px solid rgba(201,168,76,0.12)', borderBottom: '1px solid rgba(201,168,76,0.12)' }}
    >
      {/* Glow decorativo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 80% 50%, ${GOLD}0D 0%, transparent 55%), radial-gradient(ellipse at 10% 50%, rgba(27,61,47,0.18) 0%, transparent 50%)`,
        }}
      />

      <div className="max-w-4xl mx-auto relative">

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 max-w-[40px]" style={{ background: `${GOLD}40` }} />
          <span
            className="text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ color: GOLD }}
          >
            Para entrenadores
          </span>
          <div className="h-px flex-1 max-w-[40px]" style={{ background: `${GOLD}40` }} />
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Texto izquierda */}
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl leading-tight mb-4" style={{ color: IVORY }}>
              ¿Sos entrenador y no<br />llegás a fin de mes?
            </h2>
            <p className="text-base leading-relaxed mb-6" style={{ color: IVORY70 }}>
              El curso <strong style={{ color: IVORY }}>Personal Trainer Rentable</strong> te da el sistema completo para transformar tu trabajo en un negocio real y escalable.
            </p>

            <ul className="flex flex-col gap-2.5 mb-6">
              {BULLETS.map(b => (
                <li key={b} className="flex items-start gap-2.5 text-sm" style={{ color: IVORY70 }}>
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30` }}
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke={GOLD} strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <p className="text-xs" style={{ color: IVORY25 }}>
              PDF descargable · Entrega por WhatsApp · Garantía 7 días
            </p>
          </div>

          {/* Card de compra derecha */}
          <div
            className="rounded-2xl p-7"
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: `1px solid ${GOLD}22`,
              backdropFilter: 'blur(14px)',
            }}
          >
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-5"
              style={{ background: `${GOLD}18`, color: GOLD, border: `1px solid ${GOLD}35` }}
            >
              Pre-venta · Tiempo limitado
            </span>

            <div className="flex items-baseline gap-3 mb-1">
              {tieneDescuento && (
                <span className="text-xl line-through" style={{ color: IVORY25 }}>
                  ${(plan.montoOriginal as number).toLocaleString('es-AR')}
                </span>
              )}
              <span className="font-serif text-4xl font-bold" style={{ color: GOLD }}>
                ${plan.monto.toLocaleString('es-AR')}
              </span>
            </div>

            {tieneDescuento && (
              <p className="text-sm font-semibold mb-6" style={{ color: GOLD }}>
                {pctAhorro}% off de pre-venta · Ahorrás ${ahorro.toLocaleString('es-AR')}
              </p>
            )}
            {!tieneDescuento && <div className="mb-6" />}

            <Link
              href="/checkout?plan=ebook-rentable"
              className="block text-center font-bold py-4 rounded-xl text-base transition-all active:scale-[0.98] mb-3"
              style={{ background: GOLD, color: '#0a0a08' }}
            >
              Acceder al curso →
            </Link>

            <Link
              href="/curso-rentable"
              className="block text-center text-sm py-2.5 rounded-xl transition-all"
              style={{ color: IVORY45, border: `1px solid rgba(245,242,231,0.10)` }}
            >
              Ver temario completo
            </Link>

            <p className="text-xs text-center mt-5" style={{ color: IVORY25 }}>
              Pago único en pesos · El precio sube al terminar el lanzamiento
            </p>
          </div>

        </div>

      </div>
    </section>
  )
}
