'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Button from '@/components/Button'
import FormInput from '@/components/FormInput'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type EstadoEntrega = 'PENDIENTE' | 'EN_PROGRESO' | 'ENTREGADO'

interface Entrega {
  estadoAlimentacion:   EstadoEntrega
  estadoEntrenamiento:  EstadoEntrega
  estadoSuplementacion: EstadoEntrega
  estadoMealPrep:       EstadoEntrega
  estadoListaCompras:   EstadoEntrega
}

interface ClienteDetalle {
  id: string
  nombre: string
  email: string
  creadoEn: string
  perfil: {
    genero: string
    edad: number
    altura: number
    peso: number
    objetivo: string
    diasEntrenamiento: number
    nivelEstres: string
    horasSueno: number
    adherencia: string
    preferenciasAlimentarias?: string | null
    lesiones?: string | null
  } | null
  plan: ({
    id: string
    estado: string
    clasificacion?: string
    calorias?: number
    proteina?: number
    hidratos?: number
    grasas?: number
    notasTrainer?: string
    igzClasificacion?: string
    igzCalorias?: number
    igzProteina?: number
    igzHidratos?: number
    igzGrasas?: number
  } & Entrega) | null
}

// ─── DATOS DE COMPONENTES ─────────────────────────────────────────────────────

const componentes: { key: keyof Entrega; label: string; icono: string }[] = [
  { key: 'estadoAlimentacion',   label: 'Plan alimentario',       icono: '🥗' },
  { key: 'estadoEntrenamiento',  label: 'Rutina de entrenamiento', icono: '💪' },
  { key: 'estadoSuplementacion', label: 'Guía de suplementación',  icono: '💊' },
  { key: 'estadoMealPrep',       label: 'Guía de meal prep',       icono: '🍱' },
  { key: 'estadoListaCompras',   label: 'Lista de compras semanal',icono: '🛒' },
]

const estadoConfig = {
  PENDIENTE:   { label: 'Pendiente',    clase: 'bg-surface-warm text-ink-muted border-edge',          dot: 'bg-ink-muted' },
  EN_PROGRESO: { label: 'En progreso',  clase: 'bg-gold-light text-ink border-gold/40',               dot: 'bg-gold' },
  ENTREGADO:   { label: 'Entregado',    clase: 'bg-primary/10 text-primary border-primary/20',        dot: 'bg-primary' },
}

const labels: Record<string, Record<string, string>> = {
  genero:     { MASCULINO: 'Masculino', FEMENINO: 'Femenino' },
  objetivo:   { VOLUMEN: 'Volumen', DEFINICION: 'Definición', RECOMPOSICION: 'Recomposición' },
  estres:     { BAJO: 'Bajo', MEDIO: 'Medio', ALTO: 'Alto' },
  adherencia: { BAJA: 'Baja', MEDIA: 'Media', ALTA: 'Alta' },
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

export default function ClienteDetallePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [cliente, setCliente] = useState<ClienteDetalle | null>(null)
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [savingComp, setSavingComp] = useState<string | null>(null)
  const [mensaje, setMensaje]       = useState('')
  const [nombreAdmin, setNombreAdmin] = useState('')

  const [planForm, setPlanForm] = useState({
    clasificacion: '',
    calorias: '', proteina: '', hidratos: '', grasas: '',
    notasTrainer: '',
  })

  async function cargarCliente() {
    const data = await fetch(`/api/admin/cliente/${id}`).then(r => r.json())
    if (!data) return
    setCliente(data)
    if (data.plan) {
      setPlanForm({
        clasificacion: data.plan.clasificacion ?? data.plan.igzClasificacion ?? '',
        calorias:     String(data.plan.calorias  ?? data.plan.igzCalorias  ?? ''),
        proteina:     String(data.plan.proteina  ?? data.plan.igzProteina  ?? ''),
        hidratos:     String(data.plan.hidratos  ?? data.plan.igzHidratos  ?? ''),
        grasas:       String(data.plan.grasas    ?? data.plan.igzGrasas    ?? ''),
        notasTrainer: data.plan.notasTrainer ?? '',
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    cargarCliente()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router])

  async function activarPlan() {
    setSaving(true)
    setMensaje('')
    const res = await fetch(`/api/admin/activar-plan/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clasificacion: planForm.clasificacion,
        calorias:  Number(planForm.calorias),
        proteina:  Number(planForm.proteina),
        hidratos:  Number(planForm.hidratos),
        grasas:    Number(planForm.grasas),
        notasTrainer: planForm.notasTrainer,
      }),
    })
    if (res.ok) {
      setMensaje('✅ Plan activado correctamente.')
      await cargarCliente()
    } else {
      setMensaje('❌ Error al activar el plan.')
    }
    setSaving(false)
  }

  async function actualizarEntrega(componente: keyof Entrega, estado: EstadoEntrega) {
    setSavingComp(componente)
    await fetch(`/api/admin/entrega/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ componente, estado }),
    })
    await cargarCliente()
    setSavingComp(null)
  }

  function siguienteEstado(actual: EstadoEntrega): EstadoEntrega {
    if (actual === 'PENDIENTE')   return 'EN_PROGRESO'
    if (actual === 'EN_PROGRESO') return 'ENTREGADO'
    return 'PENDIENTE'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!cliente) return null

  // Contar entregas
  const entregados = cliente.plan
    ? componentes.filter(c => cliente.plan![c.key] === 'ENTREGADO').length
    : 0

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-primary hover:underline mb-6 inline-block">
          ← Volver al panel
        </Link>

        {/* ── Info del cliente ── */}
        <div className="bg-surface rounded-2xl border border-edge shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-2xl text-ink">{cliente.nombre}</h1>
              <p className="text-ink-muted text-sm mt-0.5">
                {cliente.email} · Registrado el {new Date(cliente.creadoEn).toLocaleDateString('es-AR')}
              </p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              cliente.plan?.estado === 'ACTIVO'
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-gold-light text-ink border-gold/40'
            }`}>
              {cliente.plan?.estado ?? 'PENDIENTE'}
            </span>
          </div>
        </div>

        {/* ── Entrega de componentes (sección principal operativa) ── */}
        {cliente.plan?.estado === 'ACTIVO' && (
          <div className="bg-surface rounded-2xl border border-edge shadow-sm p-6 mb-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg text-ink">Entrega del proceso integral</h2>
              <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                {entregados}/5 entregados
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {componentes.map((comp) => {
                const estadoActual = cliente.plan![comp.key]
                const cfg = estadoConfig[estadoActual]
                const isSaving = savingComp === comp.key

                return (
                  <div key={comp.key} className="flex items-center justify-between gap-3">

                    {/* Label */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="text-lg">{comp.icono}</span>
                      <span className="text-sm font-medium text-ink truncate">{comp.label}</span>
                    </div>

                    {/* Estado badge + botón cambiar */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.clase} whitespace-nowrap`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
                        {cfg.label}
                      </span>
                      <button
                        onClick={() => actualizarEntrega(comp.key, siguienteEstado(estadoActual))}
                        disabled={isSaving}
                        className="text-xs text-ink-secondary border border-edge rounded-lg px-2.5 py-1 hover:border-primary hover:text-primary transition-all disabled:opacity-40"
                      >
                        {isSaving ? '...' : '→'}
                      </button>
                    </div>

                  </div>
                )
              })}
            </div>

            <p className="text-ink-muted text-xs mt-4">
              Presioná → para avanzar al siguiente estado: Pendiente → En progreso → Entregado → Pendiente
            </p>
          </div>
        )}

        {/* ── Perfil del cliente ── */}
        {cliente.perfil && (
          <div className="bg-surface rounded-2xl border border-edge shadow-sm p-6 mb-4">
            <h2 className="font-serif text-lg text-ink mb-4">Perfil del cliente</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
              {[
                ['Género',      labels.genero[cliente.perfil.genero]],
                ['Edad',        `${cliente.perfil.edad} años`],
                ['Peso',        `${cliente.perfil.peso} kg`],
                ['Altura',      `${cliente.perfil.altura} cm`],
                ['Objetivo',    labels.objetivo[cliente.perfil.objetivo]],
                ['Días/semana', `${cliente.perfil.diasEntrenamiento} días`],
                ['Estrés',      labels.estres[cliente.perfil.nivelEstres]],
                ['Sueño',       `${cliente.perfil.horasSueno} hs`],
                ['Adherencia',  labels.adherencia[cliente.perfil.adherencia]],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 border-b border-edge last:border-0">
                  <span className="text-ink-secondary">{k}</span>
                  <span className="font-medium text-ink">{v}</span>
                </div>
              ))}
            </div>
            {cliente.perfil.preferenciasAlimentarias && (
              <div className="bg-surface-warm rounded-xl p-3 mb-2">
                <p className="text-xs font-semibold text-ink-secondary mb-1">Preferencias alimentarias</p>
                <p className="text-sm text-ink">{cliente.perfil.preferenciasAlimentarias}</p>
              </div>
            )}
            {cliente.perfil.lesiones && (
              <div className="bg-gold-light/50 border border-gold/30 rounded-xl p-3">
                <p className="text-xs font-semibold text-ink-secondary mb-1">⚠️ Lesiones / condiciones médicas</p>
                <p className="text-sm text-ink">{cliente.perfil.lesiones}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Pre-cálculo IGZ ── */}
        {cliente.plan?.igzCalorias && (
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 mb-4">
            <h2 className="font-serif text-lg text-primary mb-3">Pre-cálculo Motor IGZ</h2>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              {[
                ['Clasificación', cliente.plan.igzClasificacion],
                ['Calorías',      `${cliente.plan.igzCalorias} kcal`],
                ['Proteína',      `${cliente.plan.igzProteina}g`],
                ['Hidratos',      `${cliente.plan.igzHidratos}g`],
                ['Grasas',        `${cliente.plan.igzGrasas}g`],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <span className="text-primary/70">{k}</span>
                  <span className="font-bold text-primary">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Activar / editar plan nutricional ── */}
        <div className="bg-surface rounded-2xl border border-edge shadow-sm p-6">
          <h2 className="font-serif text-lg text-ink mb-4">
            {cliente.plan?.estado === 'ACTIVO' ? 'Editar plan nutricional' : 'Activar plan'}
          </h2>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-ink-secondary block mb-1.5">Clasificación</label>
              <select
                value={planForm.clasificacion}
                onChange={e => setPlanForm(p => ({ ...p, clasificacion: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-edge text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Seleccionar</option>
                <option value="VOLUMEN">Volumen</option>
                <option value="DEFINICION">Definición</option>
                <option value="RECOMPOSICION">Recomposición</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Calorías (kcal)" type="number" value={planForm.calorias}  onChange={e => setPlanForm(p => ({ ...p, calorias:  e.target.value }))} />
              <FormInput label="Proteína (g)"    type="number" value={planForm.proteina}  onChange={e => setPlanForm(p => ({ ...p, proteina:  e.target.value }))} />
              <FormInput label="Hidratos (g)"    type="number" value={planForm.hidratos}  onChange={e => setPlanForm(p => ({ ...p, hidratos:  e.target.value }))} />
              <FormInput label="Grasas (g)"      type="number" value={planForm.grasas}    onChange={e => setPlanForm(p => ({ ...p, grasas:    e.target.value }))} />
            </div>

            <div>
              <label className="text-sm font-medium text-ink-secondary block mb-1.5">Notas para el cliente</label>
              <textarea
                value={planForm.notasTrainer}
                onChange={e => setPlanForm(p => ({ ...p, notasTrainer: e.target.value }))}
                rows={3}
                placeholder="Recomendaciones, estructura de comidas, contexto del protocolo..."
                className="w-full px-4 py-3 rounded-xl border border-edge text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            {mensaje && (
              <p className="text-sm font-medium text-ink">{mensaje}</p>
            )}

            <Button onClick={activarPlan} loading={saving} className="py-3.5">
              {cliente.plan?.estado === 'ACTIVO' ? 'Guardar cambios' : 'Activar plan'}
            </Button>
          </div>
        </div>

      </main>
    </div>
  )
}
