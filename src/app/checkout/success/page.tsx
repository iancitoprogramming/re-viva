// /checkout/success — Pago aprobado

'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PLANES_MP, INSTAGRAM_URL, WHATSAPP_NUMBER, ES_EBOOK, type PlanMPKey } from '@/lib/constants'

function SuccessContent() {
  const searchParams = useSearchParams()
  const planKey = searchParams.get('plan') as PlanMPKey | null
  const plan = planKey && planKey in PLANES_MP ? PLANES_MP[planKey] : null
  const esEbook = planKey ? ES_EBOOK.has(planKey) : false

  // Mensaje pre-cargado para WhatsApp del cliente al trainer
  const wppHref = plan
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola Ian, soy un nuevo comprador. Pagué "${plan.titulo}" y vengo a buscar mi acceso. ¡Gracias!`)}`
    : `https://wa.me/${WHATSAPP_NUMBER}`

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">

        {/* Ícono */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">¡Pago aprobado!</h1>

        {esEbook ? (
          <p className="text-gray-600 mb-6 leading-relaxed">
            Tu pago fue confirmado. Para enviarte el material te pedimos que <strong>nos escribas por WhatsApp</strong> al botón de abajo. Ian te va a responder con el PDF en cuanto vea el mensaje.
          </p>
        ) : (
          <p className="text-gray-600 mb-6 leading-relaxed">
            Tu pago fue procesado con éxito. En las próximas <strong>24 a 72 horas hábiles</strong> Ian te va a contactar para activar tu plan personalizado.
          </p>
        )}

        {/* Resumen del plan */}
        {plan && (
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm text-left">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
              {esEbook ? 'Material adquirido' : 'Plan adquirido'}
            </p>
            <p className="font-semibold text-gray-900">{plan.titulo}</p>
            <p className="text-emerald-600 font-bold text-lg mt-1">${plan.monto.toLocaleString('es-AR')}</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {esEbook ? (
            <>
              <a
                href={wppHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <span>💬</span>
                Recibir mi PDF por WhatsApp
              </a>
              <p className="text-xs text-gray-500 leading-relaxed">
                Si no te respondemos en menos de 12 horas, escribinos directo al{' '}
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="underline" target="_blank" rel="noopener noreferrer">
                  +54 9 11 2283 5621
                </a>
                . El PDF queda guardado a tu nombre.
              </p>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-semibold transition-all"
            >
              Ir al dashboard
            </Link>
          )}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-medium text-sm hover:bg-gray-50 transition-all"
          >
            Mientras tanto, seguime en Instagram
          </a>
        </div>

      </div>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
