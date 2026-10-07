'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { INSTAGRAM_URL } from '@/lib/constants'
import dynamic from 'next/dynamic'
import MagneticEl from '@/components/MagneticEl'
import { gsap } from 'gsap'
import { useScrollToSection } from '@/components/ScrollProvider'

const HeroShader = dynamic(() => import('./HeroShader'), { ssr: false })

const GOLD    = '#C9A84C'
const GOLD_BG = 'rgba(201,168,76,0.12)'
const GOLD_BD = 'rgba(201,168,76,0.28)'
const IVORY   = '#F5F2E7'
const IVORY70 = 'rgba(245,242,231,0.70)'
const IVORY45 = 'rgba(245,242,231,0.45)'
const IVORY30 = 'rgba(245,242,231,0.30)'

export default function Hero({ standalone = false }: { standalone?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollToSection = useScrollToSection()

  function handlePlanesClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!scrollToSection?.('planes')) return // acá no hay #planes (ej. /ads) — que navegue el Link
    e.preventDefault()
    history.pushState(null, '', standalone ? '/#planes' : '#planes')
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const container = containerRef.current
    if (!container) return

    const badge    = container.querySelector('[data-hero-badge]')
    const words    = container.querySelectorAll('[data-hero-word]')
    const sub1     = container.querySelector('[data-hero-sub1]')
    const sub2     = container.querySelector('[data-hero-sub2]')
    const ctas     = container.querySelector('[data-hero-ctas]')
    const trust    = container.querySelector('[data-hero-trust]')
    const login    = container.querySelector('[data-hero-login]')

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Set initial state
    gsap.set([badge, ...Array.from(words), sub1, sub2, ctas, trust, login].filter(Boolean), {
      opacity: 0,
      y: 24,
    })

    tl.to(badge, { opacity: 1, y: 0, duration: 0.6 }, 0.1)
      .to(words, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.3)
      .to(sub1, { opacity: 1, y: 0, duration: 0.6 }, 0.8)
      .to(sub2, { opacity: 1, y: 0, duration: 0.5 }, 0.95)
      .to(ctas, { opacity: 1, y: 0, duration: 0.6 }, 1.1)
      .to(trust, { opacity: 1, y: 0, duration: 0.5 }, 1.3)
      .to(login, { opacity: 1, y: 0, duration: 0.4 }, 1.5)
  }, [])

  return (
    <section
      className={`${standalone ? 'min-h-screen' : 'min-h-[calc(100svh-64px)]'} flex flex-col justify-center px-6 py-20 relative overflow-hidden`}
      style={{ background: 'linear-gradient(180deg, #0A0A08 0%, #0F2A1F 60%, #1B3D2F 100%)' }}
    >
      {/* WebGL Shader Background — parallax target */}
      <div data-parallax-hero>
        <HeroShader />
      </div>

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

      <div ref={containerRef} className="max-w-xl mx-auto w-full text-center relative z-10">

        {/* Badge */}
        <div
          data-hero-badge
          className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full mb-10 tracking-wider uppercase"
          style={{
            background: GOLD_BG,
            border: `1px solid ${GOLD_BD}`,
            color: GOLD,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: GOLD, animation: 'goldPulse 2.5s ease-in-out infinite' }}
          />
          Metodo IGZ Trainer
        </div>

        {/* Headline — word-by-word stagger */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.15] mb-6" style={{ color: IVORY }}>
          <span data-hero-word className="inline-block">La persona que</span>
          <br />
          <span data-hero-word className="inline-block">queres ser</span>
          <br />
          <span data-hero-word className="inline-block" style={{ color: GOLD }}>ya existe.</span>
        </h1>

        {/* Subtext */}
        <p
          data-hero-sub1
          className="text-base sm:text-lg leading-relaxed mb-3 max-w-md mx-auto"
          style={{ color: IVORY70 }}
        >
          Solo necesita estructura, metodo y alguien que la acompane en serio.
        </p>
        <p
          data-hero-sub2
          className="text-sm mb-10 max-w-xs mx-auto"
          style={{ color: IVORY45 }}
        >
          Nutricion + entrenamiento + acompanamiento real. Personalizado para vos.
        </p>

        {/* CTAs magneticos */}
        <div
          data-hero-ctas
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8"
        >
          <MagneticEl strength={0.28}>
            <Link
              // En /ads (standalone) no existe la seccion #planes — llevar al home
              href={standalone ? '/#planes' : '#planes'}
              onClick={handlePlanesClick}
              className="w-full sm:w-auto block font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.97] text-center hero-cta-gold"
              style={{
                background: GOLD,
                color: '#0A0A08',
                boxShadow: '0 0 0 0 rgba(201,168,76,0)',
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
              className="w-full sm:w-auto block font-medium px-8 py-4 rounded-2xl text-base transition-all text-center hero-cta-ghost"
              style={{
                background: 'rgba(245,242,231,0.05)',
                border: '1px solid rgba(245,242,231,0.16)',
                color: IVORY,
              }}
            >
              Ver mas en Instagram
            </a>
          </MagneticEl>
        </div>

        {/* Trust */}
        <div
          data-hero-trust
          className="flex items-center justify-center gap-6 text-xs"
          style={{ color: IVORY30 }}
        >
          {['Plan 100% personalizado', 'Resultados en 90 dias', 'Sin contrato'].map(t => (
            <span key={t} className="flex items-center gap-1.5">
              <span
                className="w-1 h-1 rounded-full inline-block"
                style={{ background: GOLD, opacity: 0.5 }}
              />
              {t}
            </span>
          ))}
        </div>

        <p data-hero-login className="text-xs mt-8" style={{ color: IVORY30 }}>
          Ya tenes cuenta?{' '}
          <Link
            href="/login"
            className="font-medium transition-colors duration-200 hover-gold-link"
            style={{ color: 'rgba(201,168,76,0.75)' }}
          >
            Ingresa aca
          </Link>
        </p>
      </div>
    </section>
  )
}
