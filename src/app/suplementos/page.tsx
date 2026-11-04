// /suplementos — Catálogo de suplementos recomendados (solapa pública).
// Organizado por objetivo. Solo muestra productos activos con link de afiliado.

import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingFooter from '@/components/landing/LandingFooter'
import { OBJETIVOS_SUPLEMENTO, TEXTO_TRANSPARENCIA_AFILIADOS, AVISO_CONSULTA_MEDICA, type ObjetivoSuplementoValue } from '@/lib/suplementos'
import { WHATSAPP_CONSULTA } from '@/lib/constants'
import { SUPLEMENTOS as RESEARCH, DESCARTADOS } from '@/lib/suplementos/catalogo'

// Lo que dice la evidencia de cada producto (research de Ian). El slug de la DB
// es el mismo id de catalogo.ts; los elementos base no tienen esta ficha.
const NIVEL: Record<1 | 2, string> = { 1: 'Evidencia sólida', 2: 'Útil según el caso' }

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Suplementos recomendados',
  description: 'Los suplementos que recomendamos en Re-Viva, por objetivo: para qué sirven, a quién le convienen y cómo se toman.',
  alternates: { canonical: '/suplementos' },
}

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'
const IVORY40 = 'rgba(245,242,231,0.40)'
const GLASS   = 'rgba(255,255,255,0.035)'
const BORDER  = 'rgba(201,168,76,0.13)'

export default async function SuplementosPage({
  searchParams,
}: {
  searchParams: Promise<{ objetivo?: string }>
}) {
  const { objetivo: objetivoSlug } = await searchParams
  const objetivo = OBJETIVOS_SUPLEMENTO.find(o => o.slug === objetivoSlug)

  const productos = await prisma.suplemento.findMany({
    where: {
      activo: true,
      linkAfiliado: { not: null },
      ...(objetivo ? { objetivos: { has: objetivo.value as ObjetivoSuplementoValue } } : {}),
    },
    orderBy: [{ prioridad: 'desc' }, { nombre: 'asc' }],
  })

  const labelObjetivo = (v: string) => OBJETIVOS_SUPLEMENTO.find(o => o.value === v)?.label ?? v

  return (
    <div style={{ background: '#0a0a08' }} className="min-h-screen">
      <LandingHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="font-serif text-3xl sm:text-4xl mb-3" style={{ color: IVORY }}>
          Suplementos recomendados
        </h1>
        <p className="text-sm mb-6 max-w-xl" style={{ color: IVORY60 }}>
          Lo que usamos y recomendamos. Primero va la comida y el entrenamiento; esto suma encima.
        </p>

        {/* Solapas por objetivo */}
        <div className="flex gap-1.5 mb-6 p-1 rounded-2xl overflow-x-auto" style={{ background: GLASS, border: `1px solid ${BORDER}` }}>
          {[{ slug: undefined, label: 'Todos' }, ...OBJETIVOS_SUPLEMENTO].map(o => {
            const activo = o.slug === objetivo?.slug
            return (
              <Link
                key={o.label}
                href={o.slug ? `/suplementos?objetivo=${o.slug}` : '/suplementos'}
                className="flex-1 whitespace-nowrap text-center px-3 py-2 rounded-xl text-sm font-semibold"
                style={activo
                  ? { background: 'rgba(201,168,76,0.15)', color: GOLD, border: '1px solid rgba(201,168,76,0.28)' }
                  : { color: IVORY60, border: '1px solid transparent' }}
              >
                {o.label}
              </Link>
            )
          })}
        </div>

        {/* Transparencia (CLAUDE.md §14): texto fijo, tipografía normal */}
        <div className="mb-8 p-4 rounded-xl flex flex-col gap-2" style={{ border: `1px solid ${BORDER}` }}>
          <p className="text-sm font-semibold" style={{ color: IVORY }}>{TEXTO_TRANSPARENCIA_AFILIADOS.titulo}</p>
          {[...TEXTO_TRANSPARENCIA_AFILIADOS.parrafos, AVISO_CONSULTA_MEDICA].map(t => (
            <p key={t} className="text-sm leading-relaxed" style={{ color: IVORY60 }}>{t}</p>
          ))}
        </div>

        {productos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm mb-4" style={{ color: IVORY60 }}>
              Estamos terminando de elegir los productos de esta sección.
            </p>
            <a href={WHATSAPP_CONSULTA} target="_blank" rel="noopener noreferrer" className="text-sm underline" style={{ color: GOLD }}>
              Consultanos por WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {productos.map(p => (
              <article
                key={p.id}
                id={p.slug}
                className="rounded-2xl p-5 flex flex-col gap-3 scroll-mt-20"
                style={{ background: GLASS, border: `1px solid ${BORDER}` }}
              >
                <div>
                  <h2 className="font-serif text-xl leading-tight" style={{ color: IVORY }}>{p.nombre}</h2>
                  {p.marca && <p className="text-xs mt-0.5" style={{ color: IVORY40 }}>{p.marca}</p>}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.objetivos.map(o => (
                      <span key={o} className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(201,168,76,0.10)', color: GOLD }}>
                        {labelObjetivo(o)}
                      </span>
                    ))}
                  </div>
                </div>

                <Dato titulo="Para qué sirve" texto={p.paraQueSirve} />
                <Dato titulo="A quién se lo recomendamos" texto={p.aQuienSeRecomienda} />
                <Dato titulo="Cómo se usa (según etiqueta)" texto={p.comoSeUsa} />
                <Evidencia slug={p.slug} />

                <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                  {p.precioArs ? (
                    <span className="text-sm" style={{ color: IVORY60 }}>
                      ≈ ${p.precioArs.toLocaleString('es-AR')}
                    </span>
                  ) : <span />}
                  <a
                    href={`/suplementos/ir/${p.slug}?o=catalogo`}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="text-sm font-semibold px-4 py-2 rounded-xl"
                    style={{ background: GOLD, color: '#0a0a08' }}
                  >
                    Ver producto
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Nivel 3 del research: lo que el marketing vende y no recomendamos */}
        <section className="mt-14">
          <h2 className="font-serif text-2xl mb-2" style={{ color: IVORY }}>Lo que no recomendamos (y por qué)</h2>
          <p className="text-sm mb-5" style={{ color: IVORY60 }}>Se venden mucho. No hacen lo que prometen.</p>
          <div className="flex flex-col gap-3">
            {DESCARTADOS.map(d => (
              <details key={d.id} className="rounded-2xl p-4" style={{ background: GLASS, border: `1px solid ${BORDER}` }}>
                <summary className="cursor-pointer text-sm font-semibold" style={{ color: IVORY }}>
                  {d.nombre} <span className="font-normal" style={{ color: IVORY40 }}>— promete: {d.promesa}</span>
                </summary>
                <p className="text-sm leading-relaxed mt-3" style={{ color: IVORY60 }}>{d.porQueNo}</p>
                <Fuentes fuentes={d.fuentes} />
              </details>
            ))}
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  )
}

function Dato({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider mb-0.5" style={{ color: GOLD }}>{titulo}</p>
      <p className="text-sm leading-relaxed" style={{ color: IVORY60 }}>{texto}</p>
    </div>
  )
}

function Evidencia({ slug }: { slug: string }) {
  const r = RESEARCH.find(x => x.id === slug)
  if (!r) return null
  return (
    <details>
      <summary className="cursor-pointer text-[11px] uppercase tracking-wider" style={{ color: GOLD }}>
        {NIVEL[r.nivel]} · qué dice la evidencia
      </summary>
      <p className="text-sm leading-relaxed mt-1" style={{ color: IVORY60 }}>{r.evidencia}</p>
      <Fuentes fuentes={r.fuentes} />
    </details>
  )
}

function Fuentes({ fuentes }: { fuentes: { titulo: string; url: string }[] }) {
  if (!fuentes.length) return null
  return (
    <ul className="mt-2 flex flex-col gap-1">
      {fuentes.map(f => (
        <li key={f.url}>
          <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: IVORY40 }}>{f.titulo}</a>
        </li>
      ))}
    </ul>
  )
}
