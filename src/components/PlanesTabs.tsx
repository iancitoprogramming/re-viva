'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PLAN_CTA_HREF } from '@/lib/constants'

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY70 = 'rgba(245,242,231,0.70)'
const IVORY55 = 'rgba(245,242,231,0.55)'
const IVORY40 = 'rgba(245,242,231,0.40)'
const GLASS   = 'rgba(255,255,255,0.035)'
const GLASS_HI = 'rgba(255,255,255,0.055)'
const BORDER  = 'rgba(201,168,76,0.13)'
const DIVIDER = 'rgba(201,168,76,0.09)'

// ─── EBOOKS ───────────────────────────────────────────────────────────────────
// Para agregar caratula: setear `cover` con la URL de la imagen (ej. '/covers/ryan.jpg')

const EBOOKS = [
  {
    key:        'ebook-ryan-humiston',
    titulo:     'Ryan Humiston',
    subtitulo:  'Método de Entrenamiento',
    descripcion:'El programa de entrenamiento de Ryan Humiston. Planificación estructurada, progresión semana a semana y técnica detallada para hipertrofia real.',
    disclaimer: '⚠ Contenido meramente informativo. No es un producto oficial ni está afiliado a la marca.',
    items:      ['Programa completo de hipertrofia', 'Progresión semanal estructurada', 'Técnica por ejercicio', 'Planificación por objetivo', 'Entrega inmediata por WhatsApp'],
    href:       '/checkout?plan=ebook-ryan-humiston',
    cover:      null as string | null,
  },
  {
    key:        'ebook-gluteos',
    titulo:     'Glúteos',
    subtitulo:  'Guía Completa',
    descripcion:'Guía completa de entrenamiento de glúteos. Ejercicios, series, progresión y técnica para resultados reales y sostenibles.',
    disclaimer: null,
    items:      ['Programa enfocado en glúteos', 'Ejercicios con y sin máquinas', 'Progresión semana a semana', 'Técnica detallada por ejercicio', 'Entrega inmediata por WhatsApp'],
    href:       '/checkout?plan=ebook-gluteos',
    cover:      null as string | null,
  },
]

// ─── DATOS ────────────────────────────────────────────────────────────────────

const planOnDemand = {
  nombre: 'On Demand',
  precio: '$30.000',
  unidad: 'pago único',
  duracion: '8 a 10 semanas',
  desc: 'Tu plan personalizado, sin seguimiento directo. Autoguiado y autodidacta. 100% responsabilidad propia.',
  items: [
    'Plan alimentario completo',
    'Rutina de entrenamiento',
    'Guía de suplementación',
    'Meal prep + lista de compras',
    'Evaluación física puntual por fotos',
  ],
}

const planesOnline = [
  {
    nombre: 'Online 100%',
    duracion: 'Mensual',
    precio: '$80.000',
    unidad: '/ mes',
    desc: 'Seguimiento alimentario, guía de entrenamiento y hábitos saludables.',
    detalle: null,
  },
  {
    nombre: 'Online + Presencial',
    duracion: 'Mensual',
    precio: '$100.000',
    unidad: '/ mes',
    desc: 'Plan online con 1 clase presencial por semana incluida.',
    detalle: null,
  },
  {
    nombre: 'Online 100%',
    duracion: 'Trimestral',
    precio: '$215.000',
    unidad: '3 meses',
    desc: 'El compromiso que construye hábitos reales.',
    detalle: '≈ $71.666 por mes',
  },
  {
    nombre: 'Online + Presencial',
    duracion: 'Trimestral',
    precio: '$245.000',
    unidad: '3 meses',
    desc: 'Plan trimestral con 1 clase presencial semanal.',
    detalle: '≈ $81.666 por mes',
  },
]

const presencial = {
  mensual: [
    { sesiones: '3 veces por semana', precio: '$180.000', unidad: 'mes', clases: null },
    { sesiones: '4 veces por semana', precio: '$224.000', unidad: 'mes', clases: null },
    { sesiones: '5 veces por semana', precio: '$260.000', unidad: 'mes', clases: null },
  ],
  trimestral: [
    { sesiones: '3 veces por semana', precio: '$468.000', unidad: '3 meses', clases: '36 clases' },
    { sesiones: '4 veces por semana', precio: '$600.000', unidad: '3 meses', clases: '48 clases' },
    { sesiones: '5 veces por semana', precio: '$690.000', unidad: '3 meses', clases: '60 clases' },
  ],
  semestral: [
    { sesiones: '3 veces por semana', precio: '$900.000',    unidad: '6 meses', clases: '72 clases' },
    { sesiones: '4 veces por semana', precio: '$1.152.000',  unidad: '6 meses', clases: '96 clases' },
    { sesiones: '5 veces por semana', precio: '$1.200.000',  unidad: '6 meses', clases: '120 clases' },
  ],
}

const notaPresencial: Record<string, string> = {
  mensual:    'Entrenamiento privado presencial. Agenda mensual reservada para vos.',
  trimestral: '3 meses de proceso intensivo. Máximo 2 ciclos presenciales por persona.',
  semestral:  '6 meses de transformación real. El camino más completo. Máximo 2 ciclos por persona.',
}

// ─── CHECK ICON ──────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <span
      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)' }}
    >
      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke={GOLD}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  )
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

type TabMain = 'on-demand' | 'online' | 'presencial' | 'ebook'
type TabPres = 'mensual' | 'trimestral' | 'semestral'

export default function PlanesTabs() {
  const [tabMain, setTabMain]   = useState<TabMain>('on-demand')
  const [tabPres, setTabPres]   = useState<TabPres>('mensual')
  const [ebookIdx, setEbookIdx] = useState(0)

  return (
    <div>

      {/* ── Tabs principales ── */}
      <div
        className="flex gap-1.5 mb-8 p-1 rounded-2xl"
        style={{ background: GLASS, border: `1px solid ${BORDER}` }}
      >
        {([
          ['on-demand', 'On Demand'],
          ['online',    'Online'],
          ['presencial','Presencial'],
          ['ebook',     'Ebooks'],
        ] as [TabMain, string][]).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setTabMain(tab)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={tabMain === tab
              ? { background: 'rgba(201,168,76,0.15)', color: GOLD, border: `1px solid rgba(201,168,76,0.28)` }
              : { background: 'transparent', color: IVORY55, border: '1px solid transparent' }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── ON DEMAND ── */}
      {tabMain === 'on-demand' && (
        <div className="max-w-md mx-auto">
          <div
            className="rounded-2xl p-6 flex flex-col gap-5"
            style={{ background: GLASS_HI, border: `1px solid ${BORDER}`, backdropFilter: 'blur(14px)' }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif text-xl leading-tight" style={{ color: IVORY }}>
                {planOnDemand.nombre}
              </h3>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                style={{ background: 'rgba(201,168,76,0.12)', color: GOLD, border: `1px solid rgba(201,168,76,0.25)` }}
              >
                {planOnDemand.unidad}
              </span>
            </div>

            <p className="text-sm leading-relaxed" style={{ color: IVORY55 }}>
              {planOnDemand.desc}
            </p>

            <ul className="flex flex-col gap-2">
              {planOnDemand.items.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: IVORY70 }}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            <p className="text-xs pt-3" style={{ color: IVORY40, borderTop: `1px solid ${DIVIDER}` }}>
              Duración: <strong style={{ color: IVORY70 }}>{planOnDemand.duracion}</strong>. Sin seguimiento directo. Los materiales se entregan por WhatsApp.
            </p>

            <div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="font-serif text-3xl font-bold" style={{ color: GOLD }}>
                  {planOnDemand.precio}
                </span>
                <span className="text-sm" style={{ color: IVORY40 }}>{planOnDemand.unidad}</span>
              </div>
              <Link
                href={PLAN_CTA_HREF}
                className="block text-center font-semibold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                style={{ background: GOLD, color: '#0a0a08' }}
              >
                Quiero este plan
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── ONLINE ── */}
      {tabMain === 'online' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {planesOnline.map((plan) => (
            <div
              key={`${plan.nombre}-${plan.duracion}`}
              className="rounded-2xl p-6 flex flex-col gap-4"
              style={{ background: GLASS, border: `1px solid ${BORDER}`, backdropFilter: 'blur(14px)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-lg leading-tight" style={{ color: IVORY }}>
                  {plan.nombre}
                </h3>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                  style={{ background: 'rgba(201,168,76,0.10)', color: GOLD }}
                >
                  {plan.duracion}
                </span>
              </div>

              <p className="text-sm leading-relaxed flex-1" style={{ color: IVORY55 }}>
                {plan.desc}
              </p>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-2xl font-bold" style={{ color: GOLD }}>
                    {plan.precio}
                  </span>
                  <span className="text-sm" style={{ color: IVORY40 }}>{plan.unidad}</span>
                </div>
                {plan.detalle && (
                  <p className="text-xs font-medium mt-1" style={{ color: GOLD }}>
                    {plan.detalle}
                  </p>
                )}
              </div>

              <Link
                href={PLAN_CTA_HREF}
                className="text-center font-semibold py-3 rounded-xl text-sm transition-all"
                style={{
                  background: 'rgba(201,168,76,0.10)',
                  color: GOLD,
                  border: `1px solid rgba(201,168,76,0.20)`,
                }}
              >
                Quiero este plan
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── EBOOKS (carrusel Instagram) ── */}
      {tabMain === 'ebook' && (
        <div className="max-w-sm mx-auto">

          {/* Card con track deslizante */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: GLASS_HI, border: `1px solid ${BORDER}`, backdropFilter: 'blur(14px)' }}
          >
            {/* ── Caratula 1:1 con flechas y dots encima ── */}
            <div className="relative aspect-square overflow-hidden">

              {/* Track */}
              <div
                className="flex h-full transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${ebookIdx * 100}%)` }}
              >
                {EBOOKS.map((eb) => (
                  <div key={eb.key} className="relative w-full h-full flex-shrink-0">
                    {eb.cover ? (
                      <img src={eb.cover} alt={eb.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(201,168,76,0.22) 0%, transparent 60%), #0f0f0c' }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
                          <span className="text-xs tracking-[0.22em] uppercase" style={{ color: 'rgba(201,168,76,0.55)' }}>
                            REVIVA · IGZ Trainer
                          </span>
                          <h3 className="font-serif text-3xl leading-tight" style={{ color: IVORY }}>
                            {eb.titulo}
                          </h3>
                          <span className="text-xs tracking-widest uppercase" style={{ color: 'rgba(201,168,76,0.45)' }}>
                            {eb.subtitulo}
                          </span>
                          <div className="w-12 h-px mt-1" style={{ background: 'rgba(201,168,76,0.25)' }} />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* ── Flecha izquierda ── */}
              {ebookIdx > 0 && (
                <button
                  onClick={() => setEbookIdx(i => i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#0a0a08" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* ── Flecha derecha ── */}
              {ebookIdx < EBOOKS.length - 1 && (
                <button
                  onClick={() => setEbookIdx(i => i + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(6px)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#0a0a08" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* ── Dots sobre la imagen ── */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {EBOOKS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setEbookIdx(i)}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width:      i === ebookIdx ? 18 : 6,
                      height:     6,
                      background: i === ebookIdx ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── Contenido del ebook activo ── */}
            {EBOOKS.map((eb, i) => i === ebookIdx && (
              <div key={eb.key} className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-serif text-lg" style={{ color: IVORY }}>{eb.titulo}</h4>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                    style={{ background: 'rgba(201,168,76,0.12)', color: GOLD, border: `1px solid rgba(201,168,76,0.25)` }}
                  >
                    PDF Digital
                  </span>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: IVORY55 }}>{eb.descripcion}</p>

                {eb.disclaimer && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ color: IVORY40, background: 'rgba(245,242,231,0.04)', border: `1px solid rgba(245,242,231,0.08)` }}>
                    {eb.disclaimer}
                  </p>
                )}

                <ul className="flex flex-col gap-2">
                  {eb.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: IVORY70 }}>
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="text-xs pt-3" style={{ color: IVORY40, borderTop: `1px solid ${DIVIDER}` }}>
                  Formato PDF. Se envía por WhatsApp una vez confirmado el pago.
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-3xl font-bold" style={{ color: GOLD }}>$19.900</span>
                  <span className="text-sm" style={{ color: IVORY40 }}>pago único</span>
                </div>

                <a
                  href={eb.href}
                  className="block text-center font-semibold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                  style={{ background: GOLD, color: '#0a0a08' }}
                >
                  Comprar ebook
                </a>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── PRESENCIAL ── */}
      {tabMain === 'presencial' && (
        <div>

          {/* Sub-tabs duración */}
          <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
            {(['mensual', 'trimestral', 'semestral'] as TabPres[]).map((sub) => (
              <button
                key={sub}
                onClick={() => setTabPres(sub)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                style={tabPres === sub
                  ? { background: 'rgba(201,168,76,0.15)', color: GOLD, border: `1px solid rgba(201,168,76,0.28)` }
                  : { background: 'transparent', color: IVORY55, border: `1px solid ${BORDER}` }
                }
              >
                {sub.charAt(0).toUpperCase() + sub.slice(1)}
              </button>
            ))}
          </div>

          {/* Nota contextual */}
          <p className="text-xs mb-6 italic" style={{ color: IVORY40 }}>
            {notaPresencial[tabPres]}
          </p>

          {/* Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {presencial[tabPres].map((plan) => (
              <div
                key={plan.sesiones}
                className="rounded-2xl p-6 flex flex-col gap-3"
                style={{ background: GLASS, border: `1px solid ${BORDER}`, backdropFilter: 'blur(14px)' }}
              >
                <h3 className="font-serif text-lg leading-tight" style={{ color: IVORY }}>
                  {plan.sesiones}
                </h3>

                {plan.clases && (
                  <p className="text-xs font-semibold tracking-wide" style={{ color: GOLD }}>
                    {plan.clases}
                  </p>
                )}

                <div className="flex-1" />

                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-2xl font-bold" style={{ color: GOLD }}>
                    {plan.precio}
                  </span>
                  <span className="text-sm" style={{ color: IVORY40 }}>/ {plan.unidad}</span>
                </div>

                <Link
                  href={PLAN_CTA_HREF}
                  className="text-center font-semibold py-3 rounded-xl text-sm transition-all"
                  style={{
                    background: 'rgba(201,168,76,0.10)',
                    color: GOLD,
                    border: `1px solid rgba(201,168,76,0.20)`,
                  }}
                >
                  Quiero este plan
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
