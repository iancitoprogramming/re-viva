'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useScrollToSection } from '@/components/ScrollProvider'

const GOLD    = '#C9A84C'
const IVORY70 = 'rgba(245,242,231,0.70)'
const IVORY40 = 'rgba(245,242,231,0.35)'

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [hoverLogin, setHoverLogin] = useState(false)
  const scrollToSection = useScrollToSection()

  function handlePlanesClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!scrollToSection?.('planes')) return // esta página no tiene #planes — que navegue al home
    e.preventDefault()
    history.pushState(null, '', '/#planes')
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-500"
      style={scrolled ? {
        background: 'rgba(10,10,8,0.90)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(201,168,76,0.14)',
      } : {
        background: 'transparent',
        backdropFilter: 'none',
        borderBottom: '1px solid transparent',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span
            className="font-serif font-bold text-xl tracking-wide transition-all duration-300 group-hover:opacity-90"
            style={{ color: GOLD }}
          >
            REVIVA
          </span>
          <span
            className="text-xs tracking-widest uppercase transition-colors duration-300"
            style={{ color: IVORY40 }}
          >
            by IGZ Trainer
          </span>
        </Link>

        {/* Nav right */}
        <div className="flex items-center gap-6">
          <Link
            // "/#planes" funciona desde cualquier página (en / scrollea, en /curso-rentable navega)
            href="/#planes"
            onClick={handlePlanesClick}
            className="hidden sm:block text-xs tracking-wider uppercase transition-colors duration-200"
            style={{ color: IVORY40 }}
            onMouseEnter={e => (e.currentTarget.style.color = IVORY70)}
            onMouseLeave={e => (e.currentTarget.style.color = IVORY40)}
          >
            Planes
          </Link>

          <Link
            href="/curso-rentable"
            className="hidden sm:block text-xs tracking-wider uppercase transition-colors duration-200"
            style={{ color: IVORY40 }}
            onMouseEnter={e => (e.currentTarget.style.color = IVORY70)}
            onMouseLeave={e => (e.currentTarget.style.color = IVORY40)}
          >
            Para entrenadores
          </Link>

          <Link
            href="/login"
            className="relative text-sm font-medium transition-colors duration-200 overflow-hidden"
            style={{ color: hoverLogin ? GOLD : IVORY70 }}
            onMouseEnter={() => setHoverLogin(true)}
            onMouseLeave={() => setHoverLogin(false)}
          >
            Ingresar
            {/* gold underline animada */}
            <span
              className="absolute bottom-0 left-0 h-px transition-all duration-300 ease-out"
              style={{
                width: hoverLogin ? '100%' : '0%',
                background: GOLD,
              }}
            />
          </Link>
        </div>
      </div>
    </header>
  )
}
