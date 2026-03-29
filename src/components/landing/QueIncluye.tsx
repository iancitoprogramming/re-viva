import Link from 'next/link'
import { PLAN_CTA_HREF } from '@/lib/constants'

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
    <section className="px-6 py-24 bg-surface-warm">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-4">Incluido en todos los planes</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
            No es solo entrenamiento.<br className="hidden sm:block" /> Es un sistema completo.
          </h2>
          <p className="text-ink-secondary text-base max-w-md leading-relaxed">
            Cada proceso REVIVA incluye los cinco componentes que hacen posible un cambio real, sostenible y sin improvisación.
          </p>
        </div>

        {/* Items */}
        <div className="flex flex-col divide-y divide-edge bg-surface rounded-3xl border border-edge overflow-hidden shadow-sm">
          {items.map((item) => (
            <div key={item.num} className="px-6 py-5 flex gap-5 items-start hover:bg-surface-warm/50 transition-colors">
              <span className="font-mono text-xs font-bold text-gold/60 mt-0.5 flex-shrink-0 w-6">{item.num}</span>
              <div>
                <h3 className="font-semibold text-ink text-sm mb-1">{item.titulo}</h3>
                <p className="text-ink-secondary text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA inline */}
        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-primary rounded-2xl px-7 py-6">
          <div>
            <p className="font-serif text-lg text-ivory leading-snug mb-1">Todo incluido. Sin extras. Sin módulos aparte.</p>
            <p className="text-ivory/50 text-xs">Alimentación + entrenamiento + acompañamiento real.</p>
          </div>
          <Link
            href={PLAN_CTA_HREF}
            className="flex-shrink-0 bg-gold hover:bg-gold/90 text-ink font-semibold px-6 py-3 rounded-xl text-sm transition-all active:scale-[0.98] whitespace-nowrap"
          >
            Empezar →
          </Link>
        </div>

      </div>
    </section>
  )
}
