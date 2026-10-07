'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PLAN_CTA_HREF, PRECIO_TRANSFERENCIA } from '@/lib/constants'

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
    key:             'ebook-rentable',
    titulo:          'Personal Trainer Rentable',
    subtitulo:       'Curso para Entrenadores',
    descripcion:     'El sistema completo para que ser entrenador deje de ser un hobby y se transforme en un negocio real. Captación, conversión, retención y modelo de ingresos escalable.',
    disclaimer:      null,
    items:           ['5 capítulos + bonus aplicables desde el día 1', 'Cómo salir del modelo hora-cobrada-hora-trabajada', 'Retención y modelo de ingresos escalable', 'Plantillas de mensajes incluidas', 'Entrega por WhatsApp · Garantía 7 días'],
    href:            '/checkout?plan=ebook-rentable',
    cover:           null as string | null,
    precio:          '$54.890',
    precioOriginal:  '$87.890' as string | null,
    badge:           'Pre-venta' as string,
    badgeExtra:      'Para entrenadores' as string | null,
  },
  {
    key:             'ebook-ryan-humiston',
    titulo:          'Ryan Humiston',
    subtitulo:       'Método de Entrenamiento',
    descripcion:     'El programa de entrenamiento de Ryan Humiston. Planificación estructurada, progresión semana a semana y técnica detallada para hipertrofia real.',
    disclaimer:      '⚠ Contenido meramente informativo. No es un producto oficial ni está afiliado a la marca.',
    items:           ['Programa completo de hipertrofia', 'Progresión semanal estructurada', 'Técnica por ejercicio', 'Planificación por objetivo', 'Entrega inmediata por WhatsApp'],
    href:            '/checkout?plan=ebook-ryan-humiston',
    cover:           null as string | null,
    precio:          '$21.890',
    precioOriginal:  null,
    badge:           'PDF Digital' as string,
    badgeExtra:      null as string | null,
  },
  {
    key:             'ebook-gluteos',
    titulo:          'Glúteos',
    subtitulo:       'Guía Completa',
    descripcion:     'Guía completa de entrenamiento de glúteos. Ejercicios, series, progresión y técnica para resultados reales y sostenibles.',
    disclaimer:      null,
    items:           ['Programa enfocado en glúteos', 'Ejercicios con y sin máquinas', 'Progresión semana a semana', 'Técnica detallada por ejercicio', 'Entrega inmediata por WhatsApp'],
    href:            '/checkout?plan=ebook-gluteos',
    cover:           null as string | null,
    precio:          '$21.890',
    precioOriginal:  null,
    badge:           'PDF Digital' as string,
    badgeExtra:      null as string | null,
  },
]

// ─── DATOS ────────────────────────────────────────────────────────────────────

const planOnDemand = {
  nombre: 'On Demand',
  precio: '$33.000',
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
    precio: '$88.000',
    unidad: '/ mes',
    desc: 'Seguimiento alimentario, guía de entrenamiento y hábitos saludables.',
    detalle: null,
  },
  {
    nombre: 'Online + Presencial',
    duracion: 'Mensual',
    precio: '$110.000',
    unidad: '/ mes',
    desc: 'Plan online con 1 clase presencial por semana incluida.',
    detalle: null,
  },
  {
    nombre: 'Online 100%',
    duracion: 'Trimestral',
    precio: '$236.500',
    unidad: '3 meses',
    desc: 'El compromiso que construye hábitos reales.',
    detalle: '≈ $78.800 por mes',
  },
  {
    nombre: 'Online + Presencial',
    duracion: 'Trimestral',
    precio: '$269.500',
    unidad: '3 meses',
    desc: 'Plan trimestral con 1 clase presencial semanal.',
    detalle: '≈ $89.800 por mes',
  },
]

const presencial = {
  individual: {
    mensual: [
      { key: 'individual-2x-mensual', sesiones: '2 veces por semana', precio: '$208.000', unidad: 'mes', detalle: null as string | null },
      { key: 'individual-3x-mensual', sesiones: '3 veces por semana', precio: '$312.000', unidad: 'mes', detalle: null as string | null },
      { key: 'individual-4x-mensual', sesiones: '4 veces por semana', precio: '$416.000', unidad: 'mes', detalle: null as string | null },
      { key: 'individual-5x-mensual', sesiones: '5 veces por semana', precio: '$520.000', unidad: 'mes', detalle: null as string | null },
    ],
    trimestral: [
      { key: 'individual-2x-trimestral', sesiones: '2 veces por semana', precio: '$561.600', unidad: '3 meses', detalle: '≈ $187.200 por mes' as string | null },
      { key: 'individual-3x-trimestral', sesiones: '3 veces por semana', precio: '$842.400', unidad: '3 meses', detalle: '≈ $280.800 por mes' as string | null },
      { key: 'individual-4x-trimestral', sesiones: '4 veces por semana', precio: '$1.123.200', unidad: '3 meses', detalle: '≈ $374.400 por mes' as string | null },
      { key: 'individual-5x-trimestral', sesiones: '5 veces por semana', precio: '$1.404.000', unidad: '3 meses', detalle: '≈ $468.000 por mes' as string | null },
    ],
  },
  duo: {
    mensual: [
      { key: 'duo-2x-mensual', sesiones: '2 veces por semana', precio: '$145.600', unidad: 'mes', detalle: 'por persona' as string | null },
      { key: 'duo-3x-mensual', sesiones: '3 veces por semana', precio: '$218.400', unidad: 'mes', detalle: 'por persona' as string | null },
    ],
  },
  trios: {
    mensual: [
      { key: 'trio-2x-mensual', sesiones: '2 veces por semana', precio: '$124.800', unidad: 'mes', detalle: 'por persona' as string | null },
      { key: 'trio-3x-mensual', sesiones: '3 veces por semana', precio: '$187.200', unidad: 'mes', detalle: 'por persona' as string | null },
    ],
  },
}

const notaPresencial: Record<TabPres, string> = {
  individual: 'Entrenamiento privado presencial, 100% personalizado. Agenda reservada para vos. Por transferencia, 6% menos.',
  duo:        'Entrenás junto a otra persona. Mismo nivel de exigencia, precio compartido.',
  trios:      'Grupo reducido de 3 personas. La energía del grupo, la atención de un personal trainer.',
}

const etiquetaPresencial: Record<TabPres, string> = {
  individual: 'Individual',
  duo:        'En dúo',
  trios:      'En tríos',
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
type TabPres = 'individual' | 'duo' | 'trios'
type TabPresDuracion = 'mensual' | 'trimestral'

export default function PlanesTabs() {
  const [tabMain, setTabMain]   = useState<TabMain>('on-demand')
  const [tabPres, setTabPres]   = useState<TabPres>('individual')
  const [tabDur, setTabDur]     = useState<TabPresDuracion>('mensual')
  const [ebookIdx, setEbookIdx] = useState(0)

  // Trimestral solo existe en individual; en duo y trios es mensual nomas.
  const cardsPresencial = tabPres === 'individual'
    ? presencial.individual[tabDur]
    : presencial[tabPres].mensual

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
            data-card-reveal
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
                          <h3 className="font-serif leading-tight" style={{ color: IVORY, fontSize: eb.titulo.length > 15 ? '1.5rem' : '1.875rem' }}>
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
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-serif text-lg" style={{ color: IVORY }}>{eb.titulo}</h4>
                    {eb.badgeExtra && (
                      <span className="inline-block text-[10px] font-semibold tracking-wider uppercase mt-1" style={{ color: 'rgba(201,168,76,0.65)' }}>
                        {eb.badgeExtra}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                    style={{ background: 'rgba(201,168,76,0.12)', color: GOLD, border: `1px solid rgba(201,168,76,0.25)` }}
                  >
                    {eb.badge}
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

                <div className="flex items-baseline gap-2">
                  {eb.precioOriginal && (
                    <span className="text-base line-through" style={{ color: IVORY40 }}>{eb.precioOriginal}</span>
                  )}
                  <span className="font-serif text-3xl font-bold" style={{ color: GOLD }}>{eb.precio}</span>
                  <span className="text-sm" style={{ color: IVORY40 }}>pago único</span>
                </div>

                <a
                  href={eb.href}
                  className="block text-center font-semibold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                  style={{ background: GOLD, color: '#0a0a08' }}
                >
                  {eb.key === 'ebook-rentable' ? 'Acceder al curso' : 'Comprar ebook'}
                </a>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── PRESENCIAL ── */}
      {tabMain === 'presencial' && (
        <div>

          {/* Sub-tabs formato */}
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
            {(['individual', 'duo', 'trios'] as TabPres[]).map((sub) => (
              <button
                key={sub}
                onClick={() => setTabPres(sub)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                style={tabPres === sub
                  ? { background: 'rgba(201,168,76,0.15)', color: GOLD, border: `1px solid rgba(201,168,76,0.28)` }
                  : { background: 'transparent', color: IVORY55, border: `1px solid ${BORDER}` }
                }
              >
                {etiquetaPresencial[sub]}
              </button>
            ))}
          </div>

          {/* Sub-tabs duracion — solo individual tiene trimestral */}
          {tabPres === 'individual' && (
            <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
              {(['mensual', 'trimestral'] as TabPresDuracion[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setTabDur(sub)}
                  className="flex-shrink-0 px-3.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={tabDur === sub
                    ? { background: 'rgba(201,168,76,0.12)', color: GOLD, border: `1px solid rgba(201,168,76,0.22)` }
                    : { background: 'transparent', color: IVORY40, border: `1px solid ${BORDER}` }
                  }
                >
                  {sub === 'mensual' ? 'Mensual' : 'Trimestral · 10% off'}
                </button>
              ))}
            </div>
          )}

          {/* Nota contextual */}
          <p className="text-xs mb-6 italic" style={{ color: IVORY40 }}>
            {notaPresencial[tabPres]}
          </p>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cardsPresencial.map((plan) => (
              <div
                key={plan.key}
                className="rounded-2xl p-6 flex flex-col gap-3"
                style={{ background: GLASS, border: `1px solid ${BORDER}`, backdropFilter: 'blur(14px)' }}
              >
                <h3 className="font-serif text-lg leading-tight" style={{ color: IVORY }}>
                  {plan.sesiones}
                </h3>

                {plan.detalle && (
                  <p className="text-xs font-semibold tracking-wide" style={{ color: GOLD }}>
                    {plan.detalle}
                  </p>
                )}

                <div className="flex-1" />

                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-2xl font-bold" style={{ color: GOLD }}>
                    {plan.precio}
                  </span>
                  <span className="text-sm" style={{ color: IVORY40 }}>/ {plan.unidad}</span>
                </div>

                {PRECIO_TRANSFERENCIA[plan.key] && (
                  <p className="text-xs" style={{ color: IVORY40 }}>
                    o ${PRECIO_TRANSFERENCIA[plan.key].toLocaleString('es-AR')} por transferencia
                  </p>
                )}

                {plan.unidad === '3 meses' && (
                  <p className="text-xs" style={{ color: IVORY40 }}>
                    Hasta 3 cuotas
                  </p>
                )}

                <Link
                  href={`/checkout?plan=${plan.key}`}
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
