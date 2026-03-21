'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PLAN_CTA_HREF } from '@/lib/constants'

// ─── DATOS ────────────────────────────────────────────────────────────────────

const planesOnline = [
  {
    nombre: 'Online 100%',
    duracion: 'Mensual',
    precio: '$80.000',
    unidad: '/ mes',
    desc: 'Seguimiento nutricional completo desde donde estés.',
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

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

type TabMain = 'online' | 'presencial'
type TabPres = 'mensual' | 'trimestral' | 'semestral'

export default function PlanesTabs() {
  const [tabMain, setTabMain] = useState<TabMain>('online')
  const [tabPres, setTabPres]  = useState<TabPres>('mensual')

  return (
    <div>

      {/* ── Tabs principales ── */}
      <div className="flex gap-1.5 mb-8 p-1 bg-surface-warm rounded-2xl border border-edge">
        {(['online', 'presencial'] as TabMain[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setTabMain(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tabMain === tab
                ? 'bg-primary text-ivory shadow-sm'
                : 'text-ink-secondary hover:text-ink'
            }`}
          >
            {tab === 'online' ? 'Online' : 'Presencial'}
          </button>
        ))}
      </div>

      {/* ── ONLINE ── */}
      {tabMain === 'online' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {planesOnline.map((plan) => (
            <div
              key={`${plan.nombre}-${plan.duracion}`}
              className="bg-surface border border-edge rounded-2xl p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-lg text-ink leading-tight">{plan.nombre}</h3>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                  {plan.duracion}
                </span>
              </div>

              <p className="text-ink-secondary text-sm leading-relaxed flex-1">{plan.desc}</p>

              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-2xl font-bold text-ink">{plan.precio}</span>
                  <span className="text-ink-muted text-sm">{plan.unidad}</span>
                </div>
                {plan.detalle && (
                  <p className="text-gold text-xs font-medium mt-1">{plan.detalle}</p>
                )}
              </div>

              <Link
                href={PLAN_CTA_HREF}
                className="text-center bg-primary/8 hover:bg-primary/15 text-primary font-semibold py-3 rounded-xl text-sm transition-all"
              >
                Quiero este plan
              </Link>
            </div>
          ))}
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
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  tabPres === sub
                    ? 'bg-ink text-ivory border-ink'
                    : 'border-edge text-ink-secondary hover:border-ink-secondary'
                }`}
              >
                {sub.charAt(0).toUpperCase() + sub.slice(1)}
              </button>
            ))}
          </div>

          {/* Nota contextual */}
          <p className="text-ink-muted text-xs mb-6 italic">
            {notaPresencial[tabPres]}
          </p>

          {/* Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {presencial[tabPres].map((plan) => (
              <div
                key={plan.sesiones}
                className="bg-surface border border-edge rounded-2xl p-6 flex flex-col gap-3"
              >
                <h3 className="font-serif text-lg text-ink leading-tight">{plan.sesiones}</h3>

                {plan.clases && (
                  <p className="text-gold text-xs font-semibold tracking-wide">{plan.clases}</p>
                )}

                <div className="flex-1" />

                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-2xl font-bold text-ink">{plan.precio}</span>
                  <span className="text-ink-muted text-sm">/ {plan.unidad}</span>
                </div>

                <Link
                  href={PLAN_CTA_HREF}
                  className="text-center bg-primary/8 hover:bg-primary/15 text-primary font-semibold py-3 rounded-xl text-sm transition-all"
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
