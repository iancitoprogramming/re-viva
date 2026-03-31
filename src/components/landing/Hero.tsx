'use client'

import Link from 'next/link'
import { INSTAGRAM_URL } from '@/lib/constants'
import dynamic from 'next/dynamic'
import MagneticEl from '@/components/MagneticEl'

const HeroShader = dynamic(() => import('./HeroShader'), { ssr: false })

const GOLD    = '#C9A84C'
const GOLD_BG = 'rgba(201,168,76,0.12)'
const GOLD_BD = 'rgba(201,168,76,0.28)'
const IVORY   = '#F5F2E7'
const IVORY70 = 'rgba(245,242,231,0.70)'
const IVORY45 = 'rgba(245,242,231,0.45)'
const IVORY30 = 'rgba(245,242,231,0.30)'

export default function Hero() {
  return (
    <section
      className="min-h-[calc(100svh-64px)] flex flex-col justify-center px-6 py-20 relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0A0A08 0%, #0F2A1F 60%, #1B3D2F 100%)' }}
    >
      {/* WebGL Shader Background */}
      <HeroShader />

      {/* Overlay de legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/15 pointer-events-none" />

      {/* Blob verde — esquina inferior derecha */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          bottom: '-80px',
          right:  '-80px',
          width:  '420px',
          height: '420px',
          borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
          background: 'radial-gradient(ellipse, rgba(27,61,47,0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="max-w-xl mx-auto w-full text-center relative z-10">

        {/* Badge — delay 0 */}
        <div
          className="anim-fade-up inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-10 tracking-wider uppercase"
          style={{
            background: GOLD_BG,
            border: `1px solid ${GOLD_BD}`,
            color: GOLD,
            animationDelay: '0.1s',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: GOLD, animation: 'goldPulse 2.5s ease-in-out infinite' }}
          />
          Método IGZ Trainer
        </div>

        {/* Headline — delay 0.25s */}
        <h1
          className="anim-fade-up font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.15] mb-6"
          style={{ color: IVORY, animationDelay: '0.25s' }}
        >
          La persona que<br />
          querés ser<br />
          <span style={{ color: GOLD }}>ya existe.</span>
        </h1>

        {/* Subtext — delay 0.45s */}
        <p
          className="anim-fade-up text-base sm:text-lg leading-relaxed mb-3 max-w-md mx-auto"
          style={{ color: IVORY70, animationDelay: '0.45s' }}
        >
          Solo necesita estructura, método y alguien que la acompañe en serio.
        </p>
        <p
          className="anim-fade-up text-sm mb-10 max-w-xs mx-auto"
          style={{ color: IVORY45, animationDelay: '0.55s' }}
        >
          Nutrición + entrenamiento + acompañamiento real. Personalizado para vos.
        </p>

        {/* CTAs magnéticos — delay 0.70s */}
        <div
          className="anim-fade-up flex flex-col sm:flex-row gap-3 justify-center items-center mb-8"
          style={{ animationDelay: '0.70s' }}
        >
          <MagneticEl strength={0.28}>
            <Link
              href="#planes"
              className="w-full sm:w-auto block font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.97] text-center"
              style={{
                background: GOLD,
                color: '#0A0A08',
                boxShadow: '0 0 0 0 rgba(201,168,76,0)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(201,168,76,0.30)'
                ;(e.currentTarget as HTMLElement).style.background = '#D4B356'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 rgba(201,168,76,0)'
                ;(e.currentTarget as HTMLElement).style.background = GOLD
              }}
            >
              Ver planes y precios
            </Link>
          </MagneticEl>

          <MagneticEl strength={0.28}>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto block font-medium px-8 py-4 rounded-2xl text-base transition-all text-center"
              style={{
                background: 'rgba(245,242,231,0.05)',
                border: '1px solid rgba(245,242,231,0.16)',
                color: IVORY,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(245,242,231,0.10)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,242,231,0.25)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(245,242,231,0.05)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,242,231,0.16)'
              }}
            >
              Ver más en Instagram
            </a>
          </MagneticEl>
        </div>

        {/* Trust — delay 0.85s */}
        <div
          className="anim-fade-up flex items-center justify-center gap-6 text-xs"
          style={{ color: IVORY30, animationDelay: '0.85s' }}
        >
          {['Plan 100% personalizado', 'Resultados en 90 días', 'Sin contrato'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <span
                className="w-1 h-1 rounded-full inline-block"
                style={{ background: GOLD, opacity: 0.5 }}
              />
              {t}
            </span>
          ))}
        </div>

        <p
          className="anim-fade-in text-xs mt-8"
          style={{ color: IVORY30, animationDelay: '1s' }}
        >
          ¿Ya tenés cuenta?{' '}
          <Link
            href="/login"
            className="font-medium transition-colors duration-200"
            style={{ color: 'rgba(201,168,76,0.75)' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = GOLD)}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(201,168,76,0.75)')}
          >
            Ingresá acá
          </Link>
        </p>
      </div>
    </section>
  )
}
