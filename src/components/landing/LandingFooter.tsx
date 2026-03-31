'use client'

import Link from 'next/link'
import { INSTAGRAM_URL } from '@/lib/constants'

const GOLD    = '#C9A84C'
const IVORY50 = 'rgba(245,242,231,0.50)'
const IVORY25 = 'rgba(245,242,231,0.25)'

export default function LandingFooter() {
  return (
    <footer
      className="px-6 py-8"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(27,61,47,0.15) 0%, transparent 60%), #0a0a08',
        borderTop: '1px solid rgba(201,168,76,0.10)',
      }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-serif font-bold tracking-wide"
                style={{ color: GOLD }}>
            REVIVA
          </span>
          <span className="text-xs ml-2" style={{ color: IVORY25 }}>by IGZ Trainer</span>
        </div>
        <div className="flex gap-6">
          {[
            { href: '#planes',    label: 'Planes' },
            { href: '#pagos',     label: 'Pagos' },
            { href: INSTAGRAM_URL, label: 'Instagram', external: true },
            { href: '/login',     label: 'Ingresar' },
          ].map(({ href, label, external }) =>
            external ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors duration-200"
                style={{ color: IVORY25 }}
                onMouseOver={e => (e.currentTarget.style.color = GOLD)}
                onMouseOut={e => (e.currentTarget.style.color = IVORY25)}
              >
                {label}
              </a>
            ) : (
              <Link
                key={label}
                href={href}
                className="text-xs transition-colors duration-200"
                style={{ color: IVORY25 }}
              >
                {label}
              </Link>
            )
          )}
        </div>
        <p className="text-xs" style={{ color: IVORY25 }}>
          © {new Date().getFullYear()} REVIVA · IGZ Trainer
        </p>
      </div>
    </footer>
  )
}
