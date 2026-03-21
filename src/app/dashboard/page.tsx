'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MacroCard from '@/components/MacroCard'

const WHATSAPP_LINK = "https://wa.me/5491122835621?text=Hola%20Ian%2C%20te%20env%C3%ADo%20mi%20comprobante%20de%20pago%20para%20comenzar%20con%20REVIVA."
const INSTAGRAM_LINK = "https://instagram.com/igztrainer"

interface Plan {
  estado: 'PENDIENTE' | 'ACTIVO' | 'ARCHIVADO'
  clasificacion?: string
  calorias?: number
  proteina?: number
  hidratos?: number
  grasas?: number
  notasTrainer?: string
}

interface Usuario {
  nombre: string
  email: string
  esAdmin: boolean
  tienePerfil: boolean
  plan: Plan | null
}

const nombreClasificacion: Record<string, string> = {
  VOLUMEN:       '📈 Protocolo Volumen',
  DEFINICION:    '🔥 Protocolo Definición',
  RECOMPOSICION: '⚖️ Protocolo Recomposición',
}

export default function DashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [aliasCopiado, setAliasCopiado] = useState(false)

  function copiarAlias() {
    navigator.clipboard.writeText('REVIVA.IGZ')
    setAliasCopiado(true)
    setTimeout(() => setAliasCopiado(false), 3000)
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) { router.push('/login'); return null }
        return res.json()
      })
      .then(data => {
        if (!data) return
        if (!data.tienePerfil) { router.push('/onboarding'); return }
        setUsuario(data)
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!usuario) return null

  const plan = usuario.plan

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar nombreUsuario={usuario.nombre} esAdmin={usuario.esAdmin} />

      <main className="max-w-2xl mx-auto px-4 py-8">

        <h1 className="text-xl font-bold text-gray-900 mb-6">
          Tu plan nutricional
        </h1>

        {/* Plan PENDIENTE */}
        {(!plan || plan.estado === 'PENDIENTE') && (
          <div className="space-y-4 mb-6">

            {/* Header estado */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⏳</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Pendiente de activación</h2>
                  <div className="inline-flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs text-amber-700 font-medium">Esperando confirmación de pago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 1: Pago */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                Realizá el pago
              </h3>
              <p className="text-xs text-gray-500 mb-4 ml-8">Transferí al siguiente alias desde cualquier banco o billetera.</p>
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                <span className="font-mono font-semibold text-gray-900 tracking-wide">REVIVA.IGZ</span>
                <button
                  onClick={copiarAlias}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${aliasCopiado ? 'bg-emerald-500 text-white' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'}`}
                >
                  {aliasCopiado ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Paso 2: Comprobante WhatsApp */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                Enviá tu comprobante
              </h3>
              <p className="text-xs text-gray-500 mb-4 ml-8">Mandame una foto o captura del pago por WhatsApp para activar tu plan.</p>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-4 rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98] text-base"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Enviar comprobante por WhatsApp
              </a>
            </div>

            {/* Paso 3: Esperar activación */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                Esperá el contacto
              </h3>
              <p className="text-xs text-gray-500 ml-8">Te contacto en las próximas 24 a 72 horas hábiles para confirmar y activar tu plan personalizado.</p>
            </div>

            {/* Mientras esperás: Instagram */}
            <div className="bg-emerald-900 text-[#EDE8DF] rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-800 rounded-full blur-2xl opacity-50" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-800 rounded-full blur-2xl opacity-50" />
              <div className="relative z-10">
                <p className="font-semibold text-base mb-1">¿Querés conocer más sobre el proceso?</p>
                <p className="text-emerald-200 text-xs mb-4">Mirá mis contenidos mientras preparo tu plan.</p>
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#EDE8DF]/10 hover:bg-[#EDE8DF]/20 border border-[#EDE8DF]/20 text-[#EDE8DF] px-5 py-2.5 rounded-xl font-medium transition-colors text-sm"
                >
                  Ver en Instagram
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        )}

        {/* Plan ACTIVO */}
        {plan?.estado === 'ACTIVO' && (
          <div className="space-y-5">

            {/* Protocolo */}
            <div className="bg-emerald-600 text-white rounded-2xl p-6">
              <p className="text-emerald-200 text-sm font-medium mb-1">Tu protocolo</p>
              <h2 className="text-2xl font-bold">
                {nombreClasificacion[plan.clasificacion!] ?? plan.clasificacion}
              </h2>
            </div>

            {/* Calorías */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <p className="text-gray-500 text-sm mb-1">Calorías diarias</p>
              <p className="text-4xl font-bold text-gray-900">
                {plan.calorias?.toLocaleString()}
                <span className="text-lg font-normal text-gray-400 ml-1">kcal</span>
              </p>
            </div>

            {/* Macros */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Distribución de macros
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <MacroCard label="Proteína"  value={plan.proteina!} unit="gramos" emoji="💪" color="blue" />
                <MacroCard label="Hidratos"  value={plan.hidratos!} unit="gramos" emoji="🌾" color="yellow" />
                <MacroCard label="Grasas"    value={plan.grasas!}   unit="gramos" emoji="🥑" color="orange" />
              </div>
            </div>

            {/* Notas del trainer */}
            {plan.notasTrainer && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Notas de tu trainer
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {plan.notasTrainer}
                </p>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  )
}
