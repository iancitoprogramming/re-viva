// Página que ve el cliente luego de completar el onboarding, mientras espera activación del plan

'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import WhatsAppIcon from '@/components/WhatsAppIcon'
import { ALIAS, INSTAGRAM_URL, WHATSAPP_NUMBER, MP_SUSCRIPCION_POR_PLAN, PLANES_MP, PRECIO_TRANSFERENCIA, type PlanMPKey } from '@/lib/constants'

const pesos = (n: number) => `$${n.toLocaleString('es-AR')}`

function PendienteContent() {
  const searchParams = useSearchParams()
  const nombre = searchParams.get('nombre') ?? ''
  const plan   = searchParams.get('plan') ?? ''

  const [aliasCopiado, setAliasCopiado] = useState(false)

  const copiarAlias = () => {
    navigator.clipboard.writeText(ALIAS)
    setAliasCopiado(true)
    setTimeout(() => setAliasCopiado(false), 3000)
  }

  const checkoutHref = plan ? `/checkout?plan=${plan}` : '/checkout'
  // Planes mensuales online: débito automático de MP (no hay que acordarse de pagar cada mes)
  const suscripcionHref = MP_SUSCRIPCION_POR_PLAN[plan] ?? null

  // Qué eligió y cuánto sale: sin esto el cliente no sabe cuánto transferir.
  const planInfo = plan in PLANES_MP ? PLANES_MP[plan as PlanMPKey] : null
  const montoTransferencia = planInfo ? (PRECIO_TRANSFERENCIA[plan] ?? planInfo.monto) : null
  const comprobanteHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    planInfo && montoTransferencia
      ? `Hola Ian, te envío mi comprobante de pago de ${pesos(montoTransferencia)} por "${planInfo.titulo}" para comenzar con REVIVA.`
      : 'Hola Ian, te envío mi comprobante de pago para comenzar con REVIVA.',
  )}`

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {nombre ? `${nombre}, ya estás dentro de REVIVA` : 'Ya estás dentro de REVIVA'}
          </h1>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Pendiente de activación
          </div>
        </div>

        {/* Plan elegido y precio */}
        {planInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tu plan</p>
              <p className="font-semibold text-gray-900 text-sm leading-snug">{planInfo.titulo}</p>
            </div>
            <p className="text-emerald-700 font-bold text-xl whitespace-nowrap">{pesos(planInfo.monto)}</p>
          </div>
        )}

        {/* Opción 0: Débito automático (solo planes mensuales online) */}
        {suscripcionHref && (
          <a
            href={suscripcionHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-4 rounded-2xl font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer mb-2 no-underline"
          >
            <span>Suscribirme con débito automático</span>
            <span className="text-xs font-normal opacity-80">Mercado Pago · cancelás cuando quieras</span>
          </a>
        )}
        {suscripcionHref && (
          <p className="text-xs text-gray-500 text-center mb-4">
            Se renueva solo cada mes. Así no cortás el proceso por olvidarte de pagar.
          </p>
        )}

        {/* Opción 1: Pagar con Mercado Pago */}
        <a
          href={checkoutHref}
          className="w-full flex items-center justify-between bg-[#009EE3] hover:bg-[#0088cc] text-white px-6 py-4 rounded-2xl font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer mb-4 no-underline"
        >
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 48 48" fill="currentColor">
              <path d="M44 24c0 11.05-8.95 20-20 20S4 35.05 4 24 12.95 4 24 4s20 8.95 20 20z" opacity=".2"/>
              <path d="M34.1 17.5H13.9c-1.6 0-2.9 1.3-2.9 2.9v7.2c0 1.6 1.3 2.9 2.9 2.9h4.6l1.5 2.6c.3.5 1 .5 1.3 0l1.5-2.6h11.3c1.6 0 2.9-1.3 2.9-2.9v-7.2c0-1.6-1.3-2.9-2.9-2.9z"/>
            </svg>
            Pagar con Mercado Pago
          </div>
          <svg className="w-5 h-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>

        {/* Separador */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">o pagá por transferencia</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Pasos 1 y 2 */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="p-6 sm:p-8">

            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">1</span>
              Realizar pago
            </h2>

            <p className="text-sm text-gray-600 mb-4">
              {montoTransferencia
                ? <>Transferí <strong>{pesos(montoTransferencia)}</strong> al siguiente alias para activar tu cuenta.{planInfo && montoTransferencia < planInfo.monto ? ' Es el precio con descuento por transferencia.' : ''}</>
                : 'Transferí el valor del plan al siguiente alias para activar tu cuenta.'}
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between mb-2 border border-gray-100">
              <div className="font-mono font-medium text-gray-900 tracking-wide">{ALIAS}</div>
              <button
                onClick={copiarAlias}
                className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                {aliasCopiado ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>

            <hr className="my-6 border-gray-100" />

            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">2</span>
              Enviar comprobante
            </h2>

            <p className="text-sm text-gray-600 mb-5">
              Hacé clic abajo para enviarme el comprobante directamente por WhatsApp.
            </p>

            <a
              href={comprobanteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-4 rounded-xl font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <WhatsAppIcon />
              Enviar comprobante
            </a>
          </div>
        </div>

        {/* Paso 3 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">3</span>
            Esperá el contacto
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Una vez que confirme tu pago, te contacto en las próximas <strong>24 a 72 horas hábiles</strong> para activar tu plan personalizado.
          </p>
        </div>

        {/* Ya tengo plan pago */}
        <div className="bg-gold-light border border-gold/40 rounded-2xl p-5 mb-4 text-center">
          <p className="font-semibold text-ink text-sm mb-1">¿Ya tenés plan activo o pagaste anteriormente?</p>
          <p className="text-ink-secondary text-xs mb-4 leading-relaxed">
            Si ya realizaste un pago anterior o tenés un plan trimestral / semestral vigente, no necesitás pagar de nuevo.<br />
            Avisale a Ian y activa tu acceso en minutos.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola Ian, ya soy cliente de REVIVA y ya realicé mi pago. Quiero activar mi acceso.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            <WhatsAppIcon />
            Ya pagué, avisarle a Ian
          </a>
        </div>

        {/* Instagram mientras esperan */}
        <div className="bg-emerald-900 text-[#EDE8DF] rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-800 rounded-full blur-2xl opacity-50" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-800 rounded-full blur-2xl opacity-50" />
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-2">¿Querés conocer más sobre el proceso?</h3>
            <p className="text-emerald-100 text-sm mb-5">
              Mientras preparo tu plan, mirá mis contenidos y empezá a nutrirte de información clave.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#EDE8DF]/10 hover:bg-[#EDE8DF]/20 border border-[#EDE8DF]/20 text-[#EDE8DF] px-5 py-2.5 rounded-xl font-medium transition-colors text-sm cursor-pointer"
            >
              Mirá mis contenidos
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </main>
  )
}

export default function PendientePage() {
  return (
    <Suspense>
      <PendienteContent />
    </Suspense>
  )
}
