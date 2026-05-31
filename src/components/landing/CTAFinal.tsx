import Link from 'next/link'
import { WHATSAPP_CONSULTA, PLAN_CTA_HREF } from '@/lib/constants'

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'
const IVORY25 = 'rgba(245,242,231,0.25)'

export default function CTAFinal() {
  return (
    <section
      data-reveal
      className="px-6 py-28 text-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0a0a08 0%, #0F1F16 30%, #1B3D2F 60%, #0F1F16 85%, #0a0a08 100%)',
      }}
    >
      {/* Glow decorativo dorado */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, rgba(201,168,76,0.14) 0%, transparent 70%)`,
          top: '-80px',
        }}
      />

      {/* Segundo glow inferior */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, rgba(201,168,76,0.08) 0%, transparent 70%)`,
          bottom: '-40px',
        }}
      />

      <div className="max-w-xl mx-auto relative z-10">

        <p data-reveal-child
           className="text-xs font-semibold tracking-widest uppercase mb-6"
           style={{ color: GOLD }}>
          El momento es ahora
        </p>

        <h2 data-reveal-child
            className="font-serif text-3xl sm:text-5xl leading-tight mb-5"
            style={{ color: IVORY }}>
          Tu mejor version<br />no esta perdida.<br />
          <span style={{ color: GOLD }}>Esta esperando<br />ser construida.</span>
        </h2>

        <p data-reveal-child
           className="text-base mb-3 max-w-sm mx-auto leading-relaxed"
           style={{ color: IVORY60 }}>
          No hay un momento perfecto para empezar. Hay un momento en que te cansas de no empezar.
        </p>
        <p data-reveal-child
           className="text-sm mb-12"
           style={{ color: IVORY25 }}>
          Sin contrato. Sin compromiso a largo plazo. Solo resultados.
        </p>

        <div data-reveal-child className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          <Link
            href={PLAN_CTA_HREF}
            className="w-full sm:w-auto inline-block font-semibold px-10 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] text-center shadow-md hero-cta-gold"
            style={{ background: GOLD, color: '#0a0a08' }}
          >
            Empezar ahora
          </Link>
          <a
            href={WHATSAPP_CONSULTA}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-medium px-8 py-4 rounded-2xl text-base transition-all hero-cta-ghost"
            style={{
              background: 'rgba(245,242,231,0.06)',
              border: '1px solid rgba(245,242,231,0.16)',
              color: IVORY,
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Consultar antes
          </a>
        </div>

        <p data-reveal-child
           className="text-xs font-serif italic"
           style={{ color: IVORY25 }}>
          "Controla tu cuerpo. Controla tu vida."
        </p>

      </div>
    </section>
  )
}
