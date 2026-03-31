import Link from 'next/link'
import { PLAN_CTA_HREF } from '@/lib/constants'

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'
const IVORY40 = 'rgba(245,242,231,0.40)'
const GLASS   = 'rgba(255,255,255,0.035)'
const BORDER  = 'rgba(201,168,76,0.13)'
const DIVIDER = 'rgba(201,168,76,0.09)'

const items = [
  {
    num: '01',
    titulo: 'Plan alimentario',
    desc: 'Estructura calórica y macros adaptada a tu cuerpo, objetivo y estilo de vida. No es una dieta — es un sistema.',
  },
  {
    num: '02',
    titulo: 'Rutina de entrenamiento',
    desc: 'Programa diseñado para tu nivel, frecuencia y disponibilidad. Progresivo, medible y ajustable.',
  },
  {
    num: '03',
    titulo: 'Guía de suplementación',
    desc: 'Qué usar, cuándo y cómo. Sin humo, sin ventas de suplementos. Con criterio y evidencia.',
  },
  {
    num: '04',
    titulo: 'Guía de meal prep',
    desc: 'Cómo organizar tu semana para que la alimentación no sea un problema logístico. Simple y aplicable.',
  },
  {
    num: '05',
    titulo: 'Lista de compras semanal',
    desc: 'Todo lo que necesitás comprar para seguir el plan sin complicaciones. Lista a lista.',
  },
]

export default function QueIncluye() {
  return (
    <section
      className="px-6 py-24"
      style={{
        background:
          'radial-gradient(ellipse at 85% 40%, rgba(27,61,47,0.10) 0%, transparent 55%), #0a0a08',
      }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4"
             style={{ color: GOLD }}>
            Incluido en todos los planes
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl leading-tight mb-4"
              style={{ color: IVORY }}>
            No es solo entrenamiento.<br className="hidden sm:block" /> Es un sistema completo.
          </h2>
          <p className="text-base max-w-md leading-relaxed"
             style={{ color: IVORY60 }}>
            Cada proceso REVIVA incluye los cinco componentes que hacen posible un cambio real, sostenible y sin improvisación.
          </p>
        </div>

        {/* Items — glass card */}
        <div
          className="flex flex-col rounded-3xl overflow-hidden"
          style={{
            background: GLASS,
            border: `1px solid ${BORDER}`,
            backdropFilter: 'blur(14px)',
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.num}
              className="px-6 py-5 flex gap-5 items-start transition-colors duration-200"
              style={{
                borderBottom: i < items.length - 1 ? `1px solid ${DIVIDER}` : 'none',
              }}
            >
              <span
                className="font-mono text-xs font-bold mt-0.5 flex-shrink-0 w-6"
                style={{ color: `${GOLD}99` }}
              >
                {item.num}
              </span>
              <div>
                <h3 className="font-semibold text-sm mb-1" style={{ color: IVORY }}>
                  {item.titulo}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: IVORY60 }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA inline */}
        <div
          className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl px-7 py-6"
          style={{
            background: '#1B3D2F',
            border: `1px solid rgba(201,168,76,0.20)`,
          }}
        >
          <div>
            <p className="font-serif text-lg leading-snug mb-1" style={{ color: IVORY }}>
              Todo incluido. Sin extras. Sin módulos aparte.
            </p>
            <p className="text-xs" style={{ color: IVORY40 }}>
              Alimentación + entrenamiento + acompañamiento real.
            </p>
          </div>
          <Link
            href={PLAN_CTA_HREF}
            className="flex-shrink-0 font-semibold px-6 py-3 rounded-xl text-sm transition-all active:scale-[0.98] whitespace-nowrap"
            style={{ background: GOLD, color: '#0a0a08' }}
          >
            Empezar →
          </Link>
        </div>

      </div>
    </section>
  )
}
