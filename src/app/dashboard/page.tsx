'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import MacroCard from '@/components/MacroCard'
import { ALIAS, WHATSAPP_COMPROBANTE, INSTAGRAM_URL } from '@/lib/constants'

type EstadoEntrega = 'PENDIENTE' | 'EN_PROGRESO' | 'ENTREGADO'

interface Plan {
  estado: 'PENDIENTE' | 'ACTIVO' | 'ARCHIVADO'
  clasificacion?: string
  calorias?: number
  proteina?: number
  hidratos?: number
  grasas?: number
  notasTrainer?: string
  // Delivery
  estadoAlimentacion?:    EstadoEntrega
  estadoEntrenamiento?:   EstadoEntrega
  estadoSuplementacion?:  EstadoEntrega
  estadoMealPrep?:        EstadoEntrega
  estadoListaCompras?:    EstadoEntrega
}

interface Usuario {
  nombre: string
  email: string
  esAdmin: boolean
  tienePerfil: boolean
  plan: Plan | null
}

const nombreClasificacion: Record<string, string> = {
  VOLUMEN:       'Protocolo Volumen',
  DEFINICION:    'Protocolo Definición',
  RECOMPOSICION: 'Protocolo Recomposición',
}

const componentesEntrega: { key: keyof Plan; label: string; icono: string }[] = [
  { key: 'estadoAlimentacion',   label: 'Plan alimentario',        icono: '🥗' },
  { key: 'estadoEntrenamiento',  label: 'Rutina de entrenamiento',  icono: '💪' },
  { key: 'estadoSuplementacion', label: 'Guía de suplementación',   icono: '💊' },
  { key: 'estadoMealPrep',       label: 'Guía de meal prep',        icono: '🍱' },
  { key: 'estadoListaCompras',   label: 'Lista de compras semanal', icono: '🛒' },
]

const estadoEntregaConfig: Record<EstadoEntrega, { label: string; clase: string }> = {
  PENDIENTE:   { label: 'Pendiente',   clase: 'bg-surface-warm text-ink-muted border-edge' },
  EN_PROGRESO: { label: 'En progreso', clase: 'bg-gold-light text-ink border-gold/40' },
  ENTREGADO:   { label: 'Entregado',   clase: 'bg-primary/10 text-primary border-primary/20' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [aliasCopiado, setAliasCopiado] = useState(false)

  function copiarAlias() {
    navigator.clipboard.writeText(ALIAS)
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
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!usuario) return null

  const plan = usuario.plan

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={usuario.nombre} esAdmin={usuario.esAdmin} />

      <main className="max-w-2xl mx-auto px-4 py-8">

        <h1 className="font-serif text-2xl text-ink mb-6">
          Tu plan
        </h1>

        {/* ── Plan PENDIENTE ── */}
        {(!plan || plan.estado === 'PENDIENTE') && (
          <div className="space-y-4 mb-6">

            {/* Estado */}
            <div className="bg-surface rounded-2xl border border-edge shadow-sm p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 bg-gold-light rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⏳</span>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-ink">Pendiente de activación</h2>
                  <div className="inline-flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
                    <span className="text-xs text-ink-secondary font-medium">Esperando confirmación de pago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Paso 1: Pago */}
            <div className="bg-surface rounded-2xl border border-edge shadow-sm p-5">
              <h3 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                Realizá el pago
              </h3>
              <p className="text-xs text-ink-muted mb-4 ml-8">Transferí al siguiente alias desde cualquier banco o billetera.</p>
              <div className="bg-surface-warm rounded-xl p-4 flex items-center justify-between border border-edge">
                <span className="font-mono font-semibold text-ink tracking-wide">{ALIAS}</span>
                <button
                  onClick={copiarAlias}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    aliasCopiado
                      ? 'bg-primary text-surface'
                      : 'text-primary bg-primary/10 hover:bg-primary/15'
                  }`}
                >
                  {aliasCopiado ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            {/* Paso 2: WhatsApp */}
            <div className="bg-surface rounded-2xl border border-edge shadow-sm p-5">
              <h3 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                Enviá tu comprobante
              </h3>
              <p className="text-xs text-ink-muted mb-4 ml-8">Mandame una foto o captura del pago por WhatsApp para activar tu plan.</p>
              <a
                href={WHATSAPP_COMPROBANTE}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-4 rounded-xl font-semibold transition-all shadow-sm active:scale-[0.98] text-sm"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Enviar comprobante por WhatsApp
              </a>
            </div>

            {/* Paso 3: Esperar */}
            <div className="bg-surface rounded-2xl border border-edge shadow-sm p-5">
              <h3 className="text-sm font-bold text-ink mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                Esperá el contacto
              </h3>
              <p className="text-xs text-ink-muted ml-8">Te contacto en las próximas 24 a 72 horas hábiles para confirmar y activar tu plan personalizado.</p>
            </div>

            {/* Instagram */}
            <div className="bg-primary text-[#EDE8DF] rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-primary-dark rounded-full blur-2xl opacity-40" />
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-primary-dark rounded-full blur-2xl opacity-40" />
              <div className="relative z-10">
                <p className="font-semibold text-base mb-1">¿Querés conocer más sobre el proceso?</p>
                <p className="text-[#EDE8DF]/70 text-xs mb-4">Mirá mis contenidos mientras preparo tu plan.</p>
                <a
                  href={INSTAGRAM_URL}
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

        {/* ── Plan ACTIVO ── */}
        {plan?.estado === 'ACTIVO' && (
          <div className="space-y-5">

            {/* Protocolo */}
            <div className="bg-primary text-surface rounded-2xl p-6">
              <p className="text-[#EDE8DF]/70 text-xs font-medium mb-1 uppercase tracking-wider">Tu protocolo</p>
              <h2 className="text-xl font-serif font-bold text-[#EDE8DF]">
                {nombreClasificacion[plan.clasificacion!] ?? plan.clasificacion}
              </h2>
            </div>

            {/* Calorías */}
            <div className="bg-surface rounded-2xl border border-edge shadow-sm p-6">
              <p className="text-ink-secondary text-xs font-medium uppercase tracking-wider mb-1">Calorías diarias</p>
              <p className="text-4xl font-bold text-ink">
                {plan.calorias?.toLocaleString('es-AR')}
                <span className="text-lg font-normal text-ink-muted ml-1">kcal</span>
              </p>
            </div>

            {/* Macros */}
            <div>
              <h3 className="text-xs font-bold text-ink-secondary uppercase tracking-widest mb-3">
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
              <div className="bg-surface rounded-2xl border border-edge shadow-sm p-6">
                <h3 className="text-xs font-bold text-ink-secondary uppercase tracking-widest mb-3">
                  Notas de tu trainer
                </h3>
                <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap">
                  {plan.notasTrainer}
                </p>
              </div>
            )}

            {/* Entrega del proceso integral */}
            <div className="bg-surface rounded-2xl border border-edge shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-ink-secondary uppercase tracking-widest">
                  Tu proceso integral
                </h3>
                <span className="text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full">
                  {componentesEntrega.filter(c => (plan[c.key] as EstadoEntrega) === 'ENTREGADO').length}/5 entregados
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {componentesEntrega.map((comp) => {
                  const estado = (plan[comp.key] as EstadoEntrega) ?? 'PENDIENTE'
                  const cfg = estadoEntregaConfig[estado]
                  return (
                    <div key={comp.key} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{comp.icono}</span>
                        <span className="text-sm text-ink">{comp.label}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border whitespace-nowrap ${cfg.clase}`}>
                        {cfg.label}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-ink-muted text-xs mt-4">
                Ian va actualizando el estado de cada componente a medida que los prepara y entrega.
              </p>
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
