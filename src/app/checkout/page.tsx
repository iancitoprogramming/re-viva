// Checkout: selección de plan → create-preference → página de Mercado Pago
// (Checkout Pro) → back_urls /checkout/{success,pending,failure} + webhook

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { PLANES_MP, type PlanMPKey } from '@/lib/constants'

const PLANES_VISIBLES: { key: PlanMPKey; label: string; precio: string }[] = [
  { key: 'on-demand',                    label: 'On Demand',                          precio: '$33.000 pago único'   },
  { key: 'online-mensual',               label: 'Online 100% — Mensual',              precio: '$88.000/mes'          },
  { key: 'online-presencial-mensual',    label: 'Online + Presencial — Mensual',      precio: '$110.000/mes'         },
  { key: 'online-trimestral',            label: 'Online 100% — Trimestral',           precio: '$236.500/3 meses'     },
  { key: 'online-presencial-trimestral', label: 'Online + Presencial — Trimestral',   precio: '$269.500/3 meses'     },
  { key: 'individual-2x-mensual',        label: 'Individual 2×/semana — Mensual',     precio: '$208.000/mes'         },
  { key: 'individual-3x-mensual',        label: 'Individual 3×/semana — Mensual',     precio: '$312.000/mes'         },
  { key: 'individual-4x-mensual',        label: 'Individual 4×/semana — Mensual',     precio: '$416.000/mes'         },
  { key: 'individual-5x-mensual',        label: 'Individual 5×/semana — Mensual',     precio: '$520.000/mes'         },
  { key: 'individual-2x-trimestral',     label: 'Individual 2×/semana — Trimestral',  precio: '$561.600/3 meses'     },
  { key: 'individual-3x-trimestral',     label: 'Individual 3×/semana — Trimestral',  precio: '$842.400/3 meses'     },
  { key: 'individual-4x-trimestral',     label: 'Individual 4×/semana — Trimestral',  precio: '$1.123.200/3 meses'   },
  { key: 'individual-5x-trimestral',     label: 'Individual 5×/semana — Trimestral',  precio: '$1.404.000/3 meses'   },
  { key: 'duo-2x-mensual',               label: 'En dúo 2×/semana — Mensual',         precio: '$145.600/mes'         },
  { key: 'duo-3x-mensual',               label: 'En dúo 3×/semana — Mensual',         precio: '$218.400/mes'         },
  { key: 'trio-2x-mensual',              label: 'En trío 2×/semana — Mensual',        precio: '$124.800/mes'         },
  { key: 'trio-3x-mensual',              label: 'En trío 3×/semana — Mensual',        precio: '$187.200/mes'         },
  { key: 'ebook-ryan-humiston',          label: 'Ebook Ryan Humiston',                precio: '$21.890 pago único'   },
  { key: 'ebook-gluteos',                label: 'Ebook Glúteos',                      precio: '$21.890 pago único'   },
]

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const planFromUrl = searchParams.get('plan') as PlanMPKey | null
  const [selectedPlan, setSelectedPlan] = useState<PlanMPKey | null>(
    planFromUrl && planFromUrl in PLANES_MP ? planFromUrl : null,
  )
  const [urlPago, setUrlPago]         = useState<string | null>(null)
  const [yendo, setYendo]             = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const loadingPref = !!selectedPlan && !urlPago && !error

  const elegirPlan = (plan: PlanMPKey | null) => {
    setSelectedPlan(plan)
    setUrlPago(null)
    setError(null)
  }

  // Verificar sesión activa — preservar el plan en la URL de redirect
  useEffect(() => {
    const planParam = searchParams.get('plan')
    const redirectPath = planParam ? `/checkout?plan=${planParam}` : '/checkout'
    fetch('/api/auth/me')
      .then(r => {
        if (!r.ok) router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}&modo=registro`)
      })
      .catch(() => router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}&modo=registro`))
  }, [router, searchParams])

  // Crear la preferencia cuando se elige el plan. El cobro se hace en la página
  // de Mercado Pago (Checkout Pro): acepta todos los medios, muestra el motivo
  // si algo se rechaza, y el resultado vuelve por las back_urls y el webhook.
  // Antes era un Payment Brick embebido: dos compras reales fallaron sin que
  // el pago llegara a existir en MP.
  useEffect(() => {
    if (!selectedPlan) return
    let cancelado = false

    fetch('/api/payments/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planTipo: selectedPlan }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.detail ? `${data.error}: ${data.detail}` : data.error)
        if (!data.initPoint) throw new Error('Mercado Pago no devolvió el link de pago.')
        if (!cancelado) setUrlPago(data.initPoint)
      })
      .catch(err => { if (!cancelado) setError(err.message ?? 'No se pudo iniciar el pago.') })

    return () => { cancelado = true }
  }, [selectedPlan])

  // ── Plan no seleccionado: mostrar selector ────────────────────────────────
  if (!selectedPlan) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Elegí tu plan</h1>
            <p className="text-gray-500 text-sm">Seleccioná el plan que querés adquirir para continuar con el pago.</p>
          </div>

          <div className="flex flex-col gap-3">
            {PLANES_VISIBLES.map(p => (
              <button
                key={p.key}
                onClick={() => elegirPlan(p.key)}
                className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between hover:border-emerald-500 hover:shadow-sm transition-all text-left cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{p.label}</p>
                  <p className="text-emerald-600 text-sm font-bold mt-0.5">{p.precio}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </main>
    )
  }

  const plan = PLANES_MP[selectedPlan]

  // ── Plan seleccionado: mostrar Payment Brick ──────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Completar pago</h1>
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-full">
            <span className="text-emerald-700 font-semibold text-sm">{plan.titulo}</span>
            <span className="w-1 h-1 bg-emerald-400 rounded-full" />
            <span className="text-emerald-600 font-bold text-sm">${plan.monto.toLocaleString('es-AR')}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-700 text-sm">
            {error}
            <button
              onClick={() => elegirPlan(null)}
              className="block mt-2 text-red-600 underline text-xs cursor-pointer"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {/* Spinner mientras crea preferencia */}
        {loadingPref && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
            <p className="text-gray-500 text-sm">Preparando sistema de pago...</p>
          </div>
        )}

        {/* Ir a Mercado Pago */}
        {urlPago && !error && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
            <a
              href={urlPago}
              onClick={() => setYendo(true)}
              className="flex items-center justify-center gap-2 w-full bg-[#009EE3] hover:bg-[#0089c7] text-white font-semibold rounded-2xl py-4 transition-colors"
            >
              {yendo ? 'Abriendo Mercado Pago…' : 'Pagar con Mercado Pago'}
            </a>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              Tarjeta de crédito o débito, dinero en cuenta o efectivo.
              No hace falta tener cuenta de Mercado Pago.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              El pago lo procesa Mercado Pago. Al terminar volvés acá.
            </p>
          </div>
        )}

        {/* Cambiar plan */}
        {!loadingPref && (
          <p className="text-center mt-5">
            <button
              onClick={() => elegirPlan(null)}
              className="text-sm text-gray-400 hover:text-gray-600 underline cursor-pointer"
            >
              Cambiar plan
            </button>
            <span className="text-gray-300 mx-2">·</span>
            <a
              href="/pendiente"
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Pagar por transferencia
            </a>
          </p>
        )}

      </div>
    </main>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  )
}
