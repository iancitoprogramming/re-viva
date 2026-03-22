// /checkout/failure — Pago fallido o rechazado

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function FailureContent() {
  const searchParams = useSearchParams()
  const planKey = searchParams.get('plan')

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">

        {/* Ícono */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
          <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">El pago no se completó</h1>
        <p className="text-gray-600 mb-2 leading-relaxed">
          Hubo un problema al procesar el pago. <strong>No se realizó ningún cargo.</strong>
        </p>
        <p className="text-gray-500 text-sm mb-8">
          Podés intentarlo de nuevo con otro método de pago, o pagar por transferencia bancaria.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={planKey ? `/checkout?plan=${planKey}` : '/checkout'}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white px-6 py-4 rounded-xl font-semibold transition-all"
          >
            Intentar de nuevo
          </Link>
          <Link
            href="/pendiente"
            className="w-full border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
          >
            Pagar por transferencia bancaria
          </Link>
        </div>

      </div>
    </main>
  )
}

export default function CheckoutFailurePage() {
  return (
    <Suspense>
      <FailureContent />
    </Suspense>
  )
}
