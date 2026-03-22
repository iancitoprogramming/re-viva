// /checkout/pending — Pago pendiente de acreditación

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PLANES_MP, type PlanMPKey } from '@/lib/constants'

function PendingContent() {
  const searchParams = useSearchParams()
  const planKey = searchParams.get('plan') as PlanMPKey | null
  const plan = planKey && planKey in PLANES_MP ? PLANES_MP[planKey] : null

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">

        {/* Ícono */}
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm">
          <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-5">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Pago en proceso
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Pago pendiente</h1>
        <p className="text-gray-600 mb-3 leading-relaxed">
          Tu pago está siendo procesado. Si pagaste en efectivo (Rapipago / Pago Fácil) o por transferencia, puede demorar hasta <strong>48 horas hábiles</strong> en acreditarse.
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Una vez confirmado, Ian te va a contactar para activar tu plan personalizado.
        </p>

        {/* Resumen del plan */}
        {plan && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm text-left">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Plan</p>
            <p className="font-semibold text-gray-900">{plan.titulo}</p>
            <p className="text-amber-600 font-bold text-lg mt-1">${plan.monto.toLocaleString('es-AR')}</p>
          </div>
        )}

        <Link
          href="/dashboard"
          className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 rounded-xl font-semibold transition-all inline-block"
        >
          Ir al dashboard
        </Link>

      </div>
    </main>
  )
}

export default function CheckoutPendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  )
}
