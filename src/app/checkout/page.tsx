// Página de checkout con Mercado Pago Payment Brick
// Flujo: selección de plan → create-preference → Payment Brick → process → redirect

'use client'

import { Suspense, useEffect, useRef, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { loadMercadoPago } from '@mercadopago/sdk-js'
import { PLANES_MP, type PlanMPKey } from '@/lib/constants'

declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: Record<string, unknown>) => {
      bricks: () => {
        create: (
          brick: string,
          containerId: string,
          config: Record<string, unknown>,
        ) => Promise<{ unmount: () => void }>
      }
    }
  }
}

const PLANES_VISIBLES: { key: PlanMPKey; label: string; precio: string }[] = [
  { key: 'on-demand',                    label: 'On Demand',                          precio: '$30.000 pago único' },
  { key: 'online-mensual',               label: 'Online 100% — Mensual',              precio: '$80.000/mes'      },
  { key: 'online-presencial-mensual',    label: 'Online + Presencial — Mensual',      precio: '$100.000/mes'     },
  { key: 'online-trimestral',            label: 'Online 100% — Trimestral',           precio: '$215.000/3 meses' },
  { key: 'online-presencial-trimestral', label: 'Online + Presencial — Trimestral',   precio: '$245.000/3 meses' },
  { key: 'presencial-3x-mensual',        label: 'Presencial 3×/semana — Mensual',     precio: '$180.000/mes'     },
  { key: 'presencial-4x-mensual',        label: 'Presencial 4×/semana — Mensual',     precio: '$224.000/mes'     },
  { key: 'presencial-5x-mensual',        label: 'Presencial 5×/semana — Mensual',     precio: '$260.000/mes'     },
  { key: 'ebook-ryan-humiston',          label: 'Ebook Ryan Humiston',                precio: '$19.900 pago único' },
]

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const brickRef = useRef<{ unmount: () => void } | null>(null)

  const planFromUrl = searchParams.get('plan') as PlanMPKey | null
  const [selectedPlan, setSelectedPlan] = useState<PlanMPKey | null>(
    planFromUrl && planFromUrl in PLANES_MP ? planFromUrl : null,
  )
  const [preferenceId, setPreferenceId] = useState<string | null>(null)
  const [brickReady, setBrickReady]     = useState(false)
  const [loadingPref, setLoadingPref]   = useState(false)
  const [procesando, setProcesando]     = useState(false)
  const [error, setError]               = useState<string | null>(null)

  // Verificar sesión activa
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (!r.ok) router.replace('/login') })
      .catch(() => router.replace('/login'))
  }, [router])

  // Crear preferencia cuando se selecciona el plan
  useEffect(() => {
    if (!selectedPlan) return
    setLoadingPref(true)
    setPreferenceId(null)
    setBrickReady(false)
    setError(null)

    fetch('/api/payments/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planTipo: selectedPlan }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setPreferenceId(data.preferenceId)
      })
      .catch(err => setError(err.message ?? 'No se pudo iniciar el pago.'))
      .finally(() => setLoadingPref(false))
  }, [selectedPlan])

  // Inicializar Payment Brick cuando llega preferenceId
  const handlePlanSelect = useCallback((plan: PlanMPKey) => {
    setSelectedPlan(plan)
  }, [])

  useEffect(() => {
    if (!preferenceId || !selectedPlan) return

    const plan = PLANES_MP[selectedPlan]
    let controller: { unmount: () => void } | null = null
    let cancelled = false

    const initBrick = async () => {
      // Destruir brick anterior si existe
      if (brickRef.current) {
        brickRef.current.unmount()
        brickRef.current = null
      }

      await loadMercadoPago()
      if (cancelled) return

      const mp = new window.MercadoPago(
        process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!,
        { locale: 'es-AR' },
      )
      const bricksBuilder = mp.bricks()

      controller = await bricksBuilder.create('payment', 'payment-brick-container', {
        initialization: {
          amount: plan.monto,
          preferenceId,
        },
        customization: {
          paymentMethods: {
            creditCard:        'all',
            debitCard:         'all',
            ticket:            'all',
            bankTransfer:      'all',
            atm:               'all',
            onboarding_credits:'all',
            wallet_purchase:   'all',
          },
        },
        callbacks: {
          onReady: () => setBrickReady(true),
          onError: (err: unknown) => {
            console.error('[Payment Brick]', err)
            setError('Ocurrió un error al cargar el sistema de pago. Intentá de nuevo.')
          },
          onSubmit: ({ formData }: { formData: Record<string, unknown> }) => {
            setProcesando(true)
            return new Promise<void>((resolve, reject) => {
              fetch('/api/payments/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              })
                .then(r => r.json())
                .then(data => {
                  resolve()
                  const params = new URLSearchParams({ plan: selectedPlan })
                  if (data.status === 'approved') {
                    router.push(`/checkout/success?${params}`)
                  } else if (data.status === 'pending' || data.status === 'in_process') {
                    router.push(`/checkout/pending?${params}`)
                  } else {
                    router.push(`/checkout/failure?${params}`)
                    reject(new Error(data.status))
                  }
                })
                .catch(err => {
                  console.error('[process]', err)
                  setProcesando(false)
                  reject(err)
                })
            })
          },
        },
      })

      if (cancelled) {
        controller.unmount()
      } else {
        brickRef.current = controller
      }
    }

    initBrick().catch(err => {
      console.error('[initBrick]', err)
      setError('No se pudo inicializar el sistema de pago.')
    })

    return () => {
      cancelled = true
      controller?.unmount()
      brickRef.current = null
    }
  }, [preferenceId, selectedPlan, router])

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
                onClick={() => handlePlanSelect(p.key)}
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
              onClick={() => { setError(null); setSelectedPlan(null) }}
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

        {/* Overlay procesando pago */}
        {procesando && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mb-4" />
            <p className="text-gray-700 font-semibold">Procesando tu pago...</p>
            <p className="text-gray-500 text-sm mt-1">No cierres esta ventana.</p>
          </div>
        )}

        {/* Payment Brick */}
        {preferenceId && !error && (
          <div className={`bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-opacity duration-300 ${brickReady ? 'opacity-100' : 'opacity-0'}`}>
            {!brickReady && (
              <div className="flex justify-center items-center p-10">
                <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
              </div>
            )}
            <div id="payment-brick-container" />
          </div>
        )}

        {/* Cambiar plan */}
        {!loadingPref && (
          <p className="text-center mt-5">
            <button
              onClick={() => {
                setSelectedPlan(null)
                setPreferenceId(null)
                setBrickReady(false)
                setError(null)
              }}
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
