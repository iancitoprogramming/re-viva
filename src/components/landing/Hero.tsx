'use client'

import Link from 'next/link'
import { INSTAGRAM_URL } from '@/lib/constants'
import dynamic from 'next/dynamic'

const HeroShader = dynamic(() => import('./HeroShader'), { ssr: false })

export default function Hero() {
  return (
    <section
      className="min-h-[calc(100svh-64px)] flex flex-col justify-center px-6 py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #0F2A1F 60%, #1B3A2F 100%)' }}
    >
      {/* WebGL Shader Background */}
      <HeroShader />

      {/* Dark overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/20 pointer-events-none" />

      <div className="max-w-xl mx-auto w-full text-center relative z-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-10 tracking-wider uppercase"
             style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#D4AF37' }} />
          Método IGZ Trainer
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.15] mb-6"
            style={{ color: '#F5F2E7' }}>
          La persona que<br />
          querés ser<br />
          <span style={{ color: '#D4AF37' }}>ya existe.</span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg leading-relaxed mb-3 max-w-md mx-auto"
           style={{ color: 'rgba(245,242,231,0.70)' }}>
          Solo necesita estructura, método y alguien que la acompañe en serio.
        </p>
        <p className="text-sm mb-10 max-w-xs mx-auto"
           style={{ color: 'rgba(245,242,231,0.45)' }}>
          Nutrición + entrenamiento + acompañamiento real. Personalizado para vos.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          <Link
            href="#planes"
            className="w-full sm:w-auto font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] text-center shadow-lg"
            style={{ background: '#D4AF37', color: '#0A0A0A' }}
          >
            Ver planes y precios
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto font-medium px-8 py-4 rounded-2xl text-base transition-all text-center"
            style={{
              background: 'rgba(245,242,231,0.06)',
              border: '1px solid rgba(245,242,231,0.18)',
              color: '#F5F2E7',
            }}
          >
            Ver más en Instagram
          </a>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-6 text-xs" style={{ color: 'rgba(245,242,231,0.40)' }}>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full inline-block" style={{ background: '#D4AF37', opacity: 0.5 }} />
            Plan 100% personalizado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full inline-block" style={{ background: '#D4AF37', opacity: 0.5 }} />
            Resultados en 90 días
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full inline-block" style={{ background: '#D4AF37', opacity: 0.5 }} />
            Sin contrato
          </span>
        </div>

        <p className="text-xs mt-8" style={{ color: 'rgba(245,242,231,0.30)' }}>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-medium hover:opacity-80 transition-opacity" style={{ color: '#E6C76B' }}>
            Ingresá acá
          </Link>
        </p>
      </div>
    </section>
  )
}
