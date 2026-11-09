// /ejercicios — Biblioteca de técnica. Muestra los ejercicios que ya tienen video.

import type { Metadata } from 'next'
import Link from 'next/link'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingFooter from '@/components/landing/LandingFooter'
import { ESTACIONES } from '@/lib/ejercicios/catalogo'
import { videosCargados } from '@/lib/ejercicios/datos'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Biblioteca de ejercicios',
  description: 'Cómo se hace cada ejercicio: la clave técnica y el error más común, en videos cortos.',
  alternates: { canonical: '/ejercicios' },
}

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'
const IVORY40 = 'rgba(245,242,231,0.40)'
const GLASS   = 'rgba(255,255,255,0.035)'
const BORDER  = 'rgba(201,168,76,0.13)'

export default async function EjerciciosPage() {
  const videos = await videosCargados()
  const estaciones = ESTACIONES
    .map(e => ({ ...e, ejercicios: e.ejercicios.filter(x => videos[x.slug]) }))
    .filter(e => e.ejercicios.length > 0)

  return (
    <div style={{ background: '#0a0a08' }} className="min-h-screen">
      <LandingHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl sm:text-4xl mb-3" style={{ color: IVORY }}>
          Biblioteca de ejercicios
        </h1>
        <p className="text-sm mb-10 max-w-xl" style={{ color: IVORY60 }}>
          Cada ejercicio en menos de un minuto: la clave para hacerlo bien y el error que más se repite.
        </p>

        {estaciones.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: GLASS, border: `1px solid ${BORDER}` }}>
            <p className="text-sm mb-4" style={{ color: IVORY60 }}>
              Estamos grabando los videos. En unos días los vas a encontrar acá.
            </p>
            <Link href="/#planes" className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl" style={{ background: GOLD, color: '#0a0a08' }}>
              Ver planes
            </Link>
          </div>
        ) : estaciones.map(estacion => (
          <section key={estacion.numero} className="mb-10">
            <h2 className="font-serif text-xl mb-4" style={{ color: GOLD }}>{estacion.nombre}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {estacion.ejercicios.map(e => (
                <Link
                  key={e.slug}
                  href={`/ejercicios/${e.slug}`}
                  className="rounded-2xl p-4 block transition-colors hover:bg-white/5"
                  style={{ background: GLASS, border: `1px solid ${BORDER}` }}
                >
                  <p className="font-medium" style={{ color: IVORY }}>{e.nombre}</p>
                  <p className="text-xs mt-1" style={{ color: IVORY40 }}>{e.grupo}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
      <LandingFooter />
    </div>
  )
}
