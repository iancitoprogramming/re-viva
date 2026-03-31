'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 border-b transition-all duration-300"
      style={scrolled ? {
        background: 'rgba(248,245,239,0.95)',
        backdropFilter: 'blur(12px)',
        borderColor: '#DDD8CC',
      } : {
        background: 'rgba(10,10,10,0.60)',
        backdropFilter: 'blur(12px)',
        borderColor: 'rgba(212,175,55,0.12)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          <span
            className="font-serif font-bold text-xl tracking-wide transition-colors duration-300"
            style={{ color: scrolled ? '#2D5A3D' : '#D4AF37' }}
          >
            REVIVA
          </span>
          <span
            className="text-xs ml-2 tracking-widest uppercase transition-colors duration-300"
            style={{ color: scrolled ? '#9B9589' : 'rgba(245,242,231,0.40)' }}
          >
            by IGZ Trainer
          </span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium transition-colors duration-300"
          style={{ color: scrolled ? '#6B7B64' : 'rgba(245,242,231,0.70)' }}
        >
          Ingresar
        </Link>
      </div>
    </header>
  )
}
