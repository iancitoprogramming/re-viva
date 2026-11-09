// /ejercicios/[slug] — Un ejercicio: video, clave técnica y error común.
// Es el link que va en el documento de entrenamiento de cada cliente.

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingFooter from '@/components/landing/LandingFooter'
import { ESTACIONES, ejercicioPorSlug } from '@/lib/ejercicios/catalogo'
import { videoDeEjercicio, videosCargados } from '@/lib/ejercicios/datos'
import { embedDeVideo } from '@/lib/ejercicios/video'

export const dynamic = 'force-dynamic'

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'
const IVORY40 = 'rgba(245,242,231,0.40)'
const GLASS   = 'rgba(255,255,255,0.035)'
const BORDER  = 'rgba(201,168,76,0.13)'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ejercicio = ejercicioPorSlug((await params).slug)
  if (!ejercicio) return {}
  return {
    title: `${ejercicio.nombre}: cómo se hace`,
    description: `${ejercicio.clave} Error común: ${ejercicio.error}`,
    alternates: { canonical: `/ejercicios/${ejercicio.slug}` },
  }
}

export default async function EjercicioPage({ params }: Props) {
  const ejercicio = ejercicioPorSlug((await params).slug)
  if (!ejercicio) notFound()

  const [videoUrl, videos] = await Promise.all([videoDeEjercicio(ejercicio.slug), videosCargados()])
  const embed = videoUrl ? embedDeVideo(videoUrl) : null

  // Otros ejercicios de la misma estación que ya tienen video
  const relacionados = (ESTACIONES.find(e => e.nombre === ejercicio.estacion)?.ejercicios ?? [])
    .filter(e => e.slug !== ejercicio.slug && videos[e.slug])
    .slice(0, 6)

  return (
    <div style={{ background: '#0a0a08' }} className="min-h-screen">
      <LandingHeader />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <Link href="/ejercicios" className="text-sm" style={{ color: IVORY40 }}>← Biblioteca de ejercicios</Link>

        <h1 className="font-serif text-3xl mt-4 mb-1" style={{ color: IVORY }}>{ejercicio.nombre}</h1>
        <p className="text-sm mb-6" style={{ color: IVORY40 }}>{ejercicio.grupo} · {ejercicio.estacion}</p>

        {embed?.tipo === 'youtube' && (
          <div className="mx-auto mb-6 rounded-2xl overflow-hidden" style={{ maxWidth: 360, aspectRatio: '9 / 16', border: `1px solid ${BORDER}` }}>
            <iframe
              src={embed.src}
              title={`Video de ${ejercicio.nombre}`}
              className="w-full h-full"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        )}
        {embed?.tipo === 'archivo' && (
          <video
            src={embed.src}
            controls
            playsInline
            preload="metadata"
            className="mx-auto mb-6 rounded-2xl w-full"
            style={{ maxWidth: 360, border: `1px solid ${BORDER}` }}
          />
        )}
        {embed?.tipo === 'link' && (
          <a
            href={embed.src}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm font-semibold px-5 py-3 rounded-xl mb-6"
            style={{ background: GOLD, color: '#0a0a08' }}
          >
            Ver el video
          </a>
        )}
        {!embed && (
          <div className="rounded-2xl p-6 text-center mb-6" style={{ background: GLASS, border: `1px solid ${BORDER}` }}>
            <p className="text-sm" style={{ color: IVORY60 }}>El video de este ejercicio está en camino.</p>
          </div>
        )}

        <div className="rounded-2xl p-5 mb-3" style={{ background: GLASS, border: `1px solid ${BORDER}` }}>
          <p className="text-xs uppercase tracking-wide mb-1.5" style={{ color: GOLD }}>La clave</p>
          <p className="leading-relaxed" style={{ color: IVORY }}>{ejercicio.clave}</p>
        </div>
        <div className="rounded-2xl p-5 mb-8" style={{ background: GLASS, border: `1px solid ${BORDER}` }}>
          <p className="text-xs uppercase tracking-wide mb-1.5" style={{ color: IVORY40 }}>El error más común</p>
          <p className="leading-relaxed" style={{ color: IVORY60 }}>{ejercicio.error}</p>
        </div>

        {relacionados.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif text-lg mb-3" style={{ color: IVORY }}>En la misma estación</h2>
            <div className="flex flex-col gap-2">
              {relacionados.map(e => (
                <Link key={e.slug} href={`/ejercicios/${e.slug}`} className="rounded-xl px-4 py-3 text-sm hover:bg-white/5"
                  style={{ background: GLASS, border: `1px solid ${BORDER}`, color: IVORY60 }}>
                  {e.nombre}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-2xl p-6 text-center" style={{ border: `1px solid ${BORDER}` }}>
          <p className="text-sm mb-4" style={{ color: IVORY60 }}>
            Saber hacer el ejercicio es la mitad. La otra mitad es cuánto, cuándo y con qué progresión.
          </p>
          <Link href="/#planes" className="inline-block text-sm font-semibold px-5 py-2.5 rounded-xl" style={{ background: GOLD, color: '#0a0a08' }}>
            Ver planes
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
