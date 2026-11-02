import type { Metadata } from 'next'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingFooter from '@/components/landing/LandingFooter'
import { TERMINOS, TERMINOS_VERSION } from '@/lib/legal/terminos'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Pagos, débito automático, arrepentimiento, garantía, servicio de compra y links de afiliado de Re-Viva.',
  alternates: { canonical: '/terminos' },
}

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'
const DIVIDER = 'rgba(201,168,76,0.12)'

export default function TerminosPage() {
  return (
    <div style={{ background: '#0a0a08' }} className="min-h-screen">
      <LandingHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl mb-2" style={{ color: IVORY }}>Términos y Condiciones</h1>
        <p className="text-xs mb-8" style={{ color: IVORY60 }}>Versión {TERMINOS_VERSION}</p>

        {/* Índice corto: la gente busca una sola cosa (cancelar, garantía, compra) */}
        <nav className="flex flex-wrap gap-2 mb-10">
          {TERMINOS.map(s => (
            <a key={s.id} href={`#${s.id}`} className="text-xs px-3 py-1 rounded-full"
              style={{ border: `1px solid ${DIVIDER}`, color: GOLD }}>
              {s.titulo.replace(/^\d+\.\s*/, '')}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-8">
          {TERMINOS.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-20">
              <h2 className="font-serif text-xl mb-3" style={{ color: IVORY }}>{s.titulo}</h2>
              <div className="flex flex-col gap-3">
                {s.parrafos.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed" style={{ color: IVORY60 }}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
