import Link from 'next/link'
import { INSTAGRAM_URL, PLAN_CTA_HREF } from '@/lib/constants'

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'
const IVORY40 = 'rgba(245,242,231,0.40)'
const GLASS   = 'rgba(255,255,255,0.035)'
const BORDER  = 'rgba(201,168,76,0.13)'

const resultados = [
  {
    quote: 'Baje 11 kg en 14 semanas sin dejar de comer lo que me gusta. La estructura hace toda la diferencia.',
    nombre: 'Martin, 38',
    contexto: 'Objetivo: definicion · Plan Online 100%',
  },
  {
    quote: 'Llevaba 3 anos entrenando sin ver resultados. En 90 dias cambie mas que en todo ese tiempo.',
    nombre: 'Lucia, 34',
    contexto: 'Objetivo: recomposicion · Plan Online + Presencial',
  },
  {
    quote: 'Lo mejor no fue solo el fisico. Fue entender por que hacemos cada cosa. Ahora se cuidarme solo.',
    nombre: 'Diego, 42',
    contexto: 'Objetivo: volumen · Plan Presencial 3x/sem',
  },
]

const metricas = [
  { valor: '90', unidad: 'dias', desc: 'promedio para resultados visibles' },
  { valor: '11', unidad: 'kg', desc: 'perdida promedio en definicion' },
  { valor: '96', unidad: '%', desc: 'de adherencia al primer mes' },
]

export default function Resultados() {
  return (
    <section
      data-reveal
      className="px-6 py-24"
      style={{
        background:
          'radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.05) 0%, transparent 50%), #0a0a08',
      }}
    >
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-14" data-reveal-child>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4"
             style={{ color: GOLD }}>
            Resultados reales
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl leading-tight mb-4"
              style={{ color: IVORY }}
              data-gold-underline>
            Esto es lo que pasa cuando hay metodo.
          </h2>
          <p className="text-base max-w-md leading-relaxed"
             style={{ color: IVORY60 }}>
            Numeros y palabras de personas reales que pasaron por el proceso. Sin filtros, sin edicion.
          </p>
        </div>

        {/* Metricas */}
        <div className="grid grid-cols-3 gap-4 mb-12" data-reveal-child>
          {metricas.map((m) => (
            <div
              key={m.desc}
              className="text-center py-6 rounded-2xl"
              style={{ background: GLASS, border: `1px solid ${BORDER}` }}
            >
              <div className="flex items-baseline justify-center gap-1 mb-1">
                <span className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: GOLD }}>
                  {m.valor}
                </span>
                <span className="text-sm font-medium" style={{ color: IVORY40 }}>{m.unidad}</span>
              </div>
              <p className="text-xs px-2" style={{ color: IVORY40 }}>{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Testimonios */}
        <div className="flex flex-col gap-4 mb-10">
          {resultados.map((r, i) => (
            <div
              key={i}
              data-card-reveal
              className="rounded-2xl p-6 sm:p-8 transition-all duration-300"
              style={{
                background: GLASS,
                border: `1px solid ${BORDER}`,
                backdropFilter: 'blur(14px)',
              }}
            >
              <svg className="w-6 h-6 mb-3 opacity-30" fill={GOLD} viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <p className="font-serif text-lg sm:text-xl leading-snug mb-4" style={{ color: IVORY }}>
                {r.quote}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.15)', border: `1px solid rgba(201,168,76,0.25)` }}
                >
                  <span className="text-xs font-bold" style={{ color: GOLD }}>
                    {r.nombre.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: IVORY }}>{r.nombre}</p>
                  <p className="text-xs" style={{ color: IVORY40 }}>{r.contexto}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instagram card */}
        <div
          data-card-reveal
          className="rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8"
          style={{
            background: GLASS,
            border: `1px solid ${BORDER}`,
            backdropFilter: 'blur(14px)',
          }}
        >
          {/* Icono Instagram */}
          <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
               style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>

          {/* Texto + botones */}
          <div className="flex-1 text-center sm:text-left">
            <p className="font-serif text-xl mb-1" style={{ color: IVORY }}>@igztrainer</p>
            <p className="text-sm mb-5 leading-relaxed" style={{ color: IVORY60 }}>
              Transformaciones reales, contenido educativo y el proceso de adentro hacia afuera.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
                style={{ background: GOLD, color: '#0a0a08' }}
              >
                Ver resultados en Instagram
              </a>
              <Link
                href={PLAN_CTA_HREF}
                className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-xl text-sm transition-all"
                style={{
                  border: `1px solid ${BORDER}`,
                  color: GOLD,
                  background: 'transparent',
                }}
              >
                Empezar mi proceso
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
