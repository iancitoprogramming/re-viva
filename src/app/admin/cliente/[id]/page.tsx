'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Button from '@/components/Button'
import FormInput from '@/components/FormInput'
import { PLAN_LABELS, PLAN_DURACIONES_DIAS, WHATSAPP_NUMBER } from '@/lib/constants'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type EstadoEntrega = 'PENDIENTE' | 'EN_PROGRESO' | 'ENTREGADO'

interface ArchivoAdmin {
  id: string
  nombre: string
  tipo: string
  nombreOriginal: string
  tamano: number
  subidoEn: string
  subidoPor: string
}

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
    fechaNacimiento?: string | null
    experiencia?: string | null
    actividadLaboral?: string | null
    practicaDeportes?: boolean
    deportes?: string[]
    quiereMejorarDeporte?: string | null
    metasFisicas?: string[]
    equipamiento?: string[]
  } | null
  archivos: ArchivoAdmin[]
  plan: ({
    id: string
    estado: string
    clasificacion?: string
    calorias?: number
    proteina?: number
    hidratos?: number
    grasas?: number
    notasTrainer?: string
    tipoPlan?: string | null
    activadoEn?: string | null
    fechaVencimiento?: string | null
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
    tipoPlan: '',
  })

  // File upload state
  const [archivoFile, setArchivoFile]       = useState<File | null>(null)
  const [archivoNombre, setArchivoNombre]   = useState('')
  const [archivoTipo, setArchivoTipo]       = useState('rutina')
  const [uploadLoading, setUploadLoading]   = useState(false)
  const [uploadMsg, setUploadMsg]           = useState('')
  const [deletingArchivo, setDeletingArchivo] = useState<string | null>(null)

  // Delete client state
  const [deletingClient, setDeletingClient] = useState(false)

  const cargarCliente = useCallback(async () => {
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
        tipoPlan:     data.plan.tipoPlan ?? '',
      })
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    cargarCliente()
  }, [id, router, cargarCliente])

  async function eliminarCliente() {
    if (!confirm(`¿Eliminar a ${cliente?.nombre}? Esta acción es reversible desde la DB pero no desde el panel.`)) return
    setDeletingClient(true)
    const res = await fetch(`/api/admin/delete-cliente/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/admin')
    } else {
      alert('Error al eliminar el cliente.')
      setDeletingClient(false)
    }
  }

  async function subirArchivo(e: React.FormEvent) {
    e.preventDefault()
    if (!archivoFile || !archivoNombre.trim()) {
      setUploadMsg('❌ Completá nombre y seleccioná un archivo.')
      return
    }
    setUploadLoading(true)
    setUploadMsg('')
    const fd = new FormData()
    fd.append('archivo', archivoFile)
    fd.append('nombre', archivoNombre.trim())
    fd.append('tipo', archivoTipo)
    const res = await fetch(`/api/admin/archivos/${id}`, { method: 'POST', body: fd })
    if (res.ok) {
      setUploadMsg('✅ Archivo subido correctamente.')
      setArchivoFile(null)
      setArchivoNombre('')
      await cargarCliente()
    } else {
      const data = await res.json()
      setUploadMsg(`❌ ${data.error ?? 'Error al subir el archivo.'}`)
    }
    setUploadLoading(false)
  }

  async function eliminarArchivo(archivoId: string) {
    if (!confirm('¿Eliminar este archivo?')) return
    setDeletingArchivo(archivoId)
    await fetch(`/api/admin/archivos/${id}?archivoId=${archivoId}`, { method: 'DELETE' })
    await cargarCliente()
    setDeletingArchivo(null)
  }

  function formatBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

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
        tipoPlan:  planForm.tipoPlan || null,
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

  // Estado del plan con vencimiento (fuera de función para evitar null issues)
  const planVenc = cliente.plan?.fechaVencimiento
  const diasVenc = planVenc ? Math.ceil((new Date(planVenc).getTime() - Date.now()) / 86400000) : null
  const estadoPlanCalc =
    !cliente.plan || cliente.plan.estado !== 'ACTIVO' ? null
    : !planVenc ? 'ACTIVO'
    : diasVenc! <= 0 ? 'VENCIDO'
    : diasVenc! <= 7 ? 'PROXIMO'
    : 'ACTIVO'

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
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-2xl text-ink">{cliente.nombre}</h1>
              <p className="text-ink-muted text-sm mt-0.5 break-all">
                {cliente.email} · Registrado el {new Date(cliente.creadoEn).toLocaleDateString('es-AR')}
              </p>
              {cliente.plan?.tipoPlan && (
                <p className="text-ink-secondary text-xs mt-1">
                  Plan: <strong>{PLAN_LABELS[cliente.plan.tipoPlan] ?? cliente.plan.tipoPlan}</strong>
                </p>
              )}
              {cliente.plan?.activadoEn && (
                <p className="text-ink-secondary text-xs mt-0.5">
                  Activado: {new Date(cliente.plan.activadoEn).toLocaleDateString('es-AR')}
                  {cliente.plan?.fechaVencimiento && (
                    <> · Vence: <strong className={estadoPlanCalc === 'VENCIDO' ? 'text-red-600' : estadoPlanCalc === 'PROXIMO' ? 'text-amber-600' : 'text-ink'}>
                      {new Date(cliente.plan.fechaVencimiento).toLocaleDateString('es-AR')}
                    </strong></>
                  )}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                estadoPlanCalc === 'VENCIDO'  ? 'bg-red-50 text-red-700 border-red-200' :
                estadoPlanCalc === 'PROXIMO'  ? 'bg-amber-100 text-amber-800 border-amber-300' :
                cliente.plan?.estado === 'ACTIVO' ? 'bg-primary/10 text-primary border-primary/20' :
                'bg-gold-light text-ink border-gold/40'
              }`}>
                {estadoPlanCalc === 'VENCIDO' ? 'Vencido' :
                 estadoPlanCalc === 'PROXIMO' ? '⚠ Próximo a vencer' :
                 cliente.plan?.estado ?? 'PENDIENTE'}
              </span>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola ${cliente.nombre}, te habla Ian de REVIVA.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#25D366] border border-[#25D366]/30 rounded-lg px-2.5 py-1 hover:bg-[#25D366]/10 transition-all"
              >
                WhatsApp →
              </a>
              <button
                onClick={eliminarCliente}
                disabled={deletingClient}
                className="text-xs text-red-600 border border-red-200 rounded-lg px-2.5 py-1 hover:bg-red-50 transition-all disabled:opacity-40"
              >
                {deletingClient ? '...' : 'Eliminar'}
              </button>
            </div>
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

            <div className="mt-4 bg-surface-warm border border-edge rounded-xl p-3">
              <p className="text-ink-muted text-xs">
                <strong className="text-ink-secondary">Recordatorio:</strong> Todos los archivos (plan alimentario, rutina, guía de suplementación, meal prep y lista de compras) se envían al cliente por <strong>WhatsApp</strong>.
              </p>
            </div>
          </div>
        )}

        {/* ── Archivos del cliente ── */}
        <div className="bg-surface rounded-2xl border border-edge shadow-sm p-6 mb-4">
          <h2 className="font-serif text-lg text-ink mb-1">Archivos del cliente</h2>
          <p className="text-ink-muted text-xs mb-4">Los archivos subidos aquí aparecen en el dashboard del cliente para descargar.</p>

          {/* Lista de archivos existentes */}
          {cliente.archivos.length > 0 && (
            <div className="flex flex-col gap-2 mb-5">
              {cliente.archivos.map(a => (
                <div key={a.id} className="flex items-center justify-between gap-3 p-3 bg-surface-warm rounded-xl border border-edge">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{a.nombre}</p>
                      <p className="text-xs text-ink-muted">{a.nombreOriginal} · {formatBytes(a.tamano)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => eliminarArchivo(a.id)}
                    disabled={deletingArchivo === a.id}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors flex-shrink-0 disabled:opacity-40"
                  >
                    {deletingArchivo === a.id ? '...' : 'Quitar'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Form subida */}
          <form onSubmit={subirArchivo} className="flex flex-col gap-3 border-t border-edge pt-4">
            <p className="text-xs font-bold text-ink-secondary uppercase tracking-widest">Subir nuevo archivo</p>
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Nombre de display"
                type="text"
                placeholder="Rutina Semana 1"
                value={archivoNombre}
                onChange={e => setArchivoNombre(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-secondary">Tipo</label>
                <select
                  value={archivoTipo}
                  onChange={e => setArchivoTipo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-edge text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="rutina">Rutina de entrenamiento</option>
                  <option value="alimentacion">Plan alimentario</option>
                  <option value="suplementacion">Suplementación</option>
                  <option value="meal_prep">Meal prep</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-secondary">Archivo (DOCX, PDF, XLSX — máx 20 MB)</label>
              <input
                type="file"
                accept=".docx,.doc,.pdf,.xlsx"
                onChange={e => setArchivoFile(e.target.files?.[0] ?? null)}
                className="text-sm text-ink-secondary file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-edge file:bg-surface-warm file:text-ink file:font-medium hover:file:bg-primary/5 cursor-pointer"
              />
            </div>
            {uploadMsg && <p className="text-sm font-medium">{uploadMsg}</p>}
            <Button type="submit" loading={uploadLoading} variant="secondary">
              Subir archivo
            </Button>
          </form>
        </div>

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
                ...(cliente.perfil.fechaNacimiento
                  ? [['Cumpleaños', new Date(cliente.perfil.fechaNacimiento).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })]]
                  : []),
                ...(cliente.perfil.experiencia ? [['Experiencia', cliente.perfil.experiencia]] : []),
                ...(cliente.perfil.actividadLaboral ? [['Actividad laboral', cliente.perfil.actividadLaboral]] : []),
                ...(cliente.perfil.practicaDeportes !== undefined ? [['Practica deportes', cliente.perfil.practicaDeportes ? 'Sí' : 'No']] : []),
                ...(cliente.perfil.deportes?.length ? [['Deportes', cliente.perfil.deportes.join(', ')]] : []),
                ...(cliente.perfil.equipamiento?.length ? [['Equipamiento', cliente.perfil.equipamiento.join(', ')]] : []),
                ...(cliente.perfil.metasFisicas?.length ? [['Metas físicas', cliente.perfil.metasFisicas.join(', ')]] : []),
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
              <label className="text-sm font-medium text-ink-secondary block mb-1.5">Tipo de plan</label>
              <select
                value={planForm.tipoPlan}
                onChange={e => setPlanForm(p => ({ ...p, tipoPlan: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-edge text-sm text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Sin especificar</option>
                {Object.entries(PLAN_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v} ({PLAN_DURACIONES_DIAS[k] ?? 30} días)</option>
                ))}
              </select>
              {planForm.tipoPlan && (
                <p className="text-xs text-ink-muted mt-1">
                  Duración: <strong>{PLAN_DURACIONES_DIAS[planForm.tipoPlan] ?? 30} días</strong>. La fecha de vencimiento se calcula automáticamente al activar.
                </p>
              )}
            </div>

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
