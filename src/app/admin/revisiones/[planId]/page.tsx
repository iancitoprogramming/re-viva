'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import type { GeneratedPlan } from '@/lib/plans/types'

interface ReviewDetail {
  id: string
  clientId: string
  prioridad: string
  estado: string
  requiereRevisionManual: boolean
  flagsDetectados: string[]
  proofreaderReportJson: unknown
  planJson: GeneratedPlan
  aprobadoAt: string | null
  entregadoAt: string | null
  modificacionesJson: unknown
  client: { id: string; nombre: string; email: string }
  planGeneration: {
    modelUsed: string
    costUSD: number
    creadoEn: string
  }
}

type Tab = 'resumen' | 'entrenamiento' | 'nutricion' | 'suplementacion' | 'editor'

export default function RevisionDetallePage() {
  const router = useRouter()
  const { planId } = useParams<{ planId: string }>()

  const [review, setReview] = useState<ReviewDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('resumen')
  const [planEditado, setPlanEditado] = useState('')
  const [jsonValido, setJsonValido] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [aprobando, setAprobando] = useState(false)
  const [rechazando, setRechazando] = useState(false)
  const [notasTrainer, setNotasTrainer] = useState('')
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [msgExito, setMsgExito] = useState('')
  const [msgError, setMsgError] = useState('')

  const cargar = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/reviews/${planId}`, { credentials: 'include' })
    if (res.status === 401 || res.status === 403) { router.push('/login'); return }
    if (!res.ok) { setLoading(false); return }
    const data = await res.json()
    setReview(data)
    setPlanEditado(JSON.stringify(data.planJson, null, 2))
    setLoading(false)
  }, [planId, router])

  useEffect(() => { cargar() }, [cargar])

  const handleJsonChange = (val: string) => {
    setPlanEditado(val)
    try { JSON.parse(val); setJsonValido(true) } catch { setJsonValido(false) }
  }

  const guardarCambios = async () => {
    if (!jsonValido) return
    setGuardando(true)
    const res = await fetch(`/api/admin/reviews/${planId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ planJson: JSON.parse(planEditado) }),
    })
    setGuardando(false)
    if (res.ok) {
      setMsgExito('Cambios guardados.')
      await cargar()
    } else {
      setMsgError('Error al guardar.')
    }
  }

  const aprobar = async () => {
    if (!confirm('¿Aprobar y enviar el plan al cliente?')) return
    setAprobando(true)
    setMsgError('')
    const res = await fetch(`/api/admin/reviews/${planId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ notasTrainer: notasTrainer || null }),
    })
    setAprobando(false)
    if (res.ok) {
      const data = await res.json()
      setMsgExito(`Plan aprobado y enviado. DOCX: ${data.docxUrl}`)
      await cargar()
    } else {
      const data = await res.json()
      setMsgError(data.error ?? 'Error al aprobar.')
    }
  }

  const rechazar = async () => {
    if (!motivoRechazo.trim()) { setMsgError('Ingresá un motivo de rechazo.'); return }
    if (!confirm('¿Rechazar este plan?')) return
    setRechazando(true)
    setMsgError('')
    const res = await fetch(`/api/admin/reviews/${planId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ motivo: motivoRechazo }),
    })
    setRechazando(false)
    if (res.ok) {
      setMsgExito('Plan rechazado.')
      await cargar()
    } else {
      setMsgError('Error al rechazar.')
    }
  }

  const regenerar = async () => {
    if (!motivoRechazo.trim()) { setMsgError('Ingresá un motivo para la regeneración.'); return }
    if (!confirm('¿Rechazar y encolar para regeneración automática?')) return
    setRechazando(true)
    setMsgError('')
    const res = await fetch(`/api/admin/reviews/${planId}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ motivo: motivoRechazo }),
    })
    setRechazando(false)
    if (res.ok) {
      setMsgExito('Encolado para regeneración.')
      await cargar()
    } else {
      const data = await res.json()
      setMsgError(data.error ?? 'Error al regenerar.')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a08] text-white flex items-center justify-center">
      <div className="text-gray-500">Cargando…</div>
    </div>
  )

  if (!review) return (
    <div className="min-h-screen bg-[#0a0a08] text-white flex items-center justify-center">
      <div className="text-gray-500">Revisión no encontrada.</div>
    </div>
  )

  const plan = review.planJson
  const esPendiente = review.estado === 'PENDIENTE'

  return (
    <div className="min-h-screen bg-[#0a0a08] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link href="/admin/revisiones" className="text-xs text-gray-500 hover:text-[#C9A84C] mb-2 inline-block">
              ← Cola de revisiones
            </Link>
            <h1 className="text-xl font-bold text-[#C9A84C]">{review.client.nombre}</h1>
            <p className="text-sm text-gray-400">{review.client.email}</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2 items-center">
              <span className={`text-xs px-2 py-1 rounded-full border ${
                review.prioridad === 'alta' ? 'bg-red-900/30 text-red-300 border-red-700'
                : review.prioridad === 'media' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700'
                : 'bg-green-900/30 text-green-300 border-green-700'
              }`}>
                Prioridad {review.prioridad}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full border ${
                review.estado === 'PENDIENTE' ? 'bg-blue-900/30 text-blue-300 border-blue-700'
                : review.estado === 'APROBADO' ? 'bg-green-900/30 text-green-300 border-green-700'
                : 'bg-red-900/30 text-red-300 border-red-700'
              }`}>
                {review.estado}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {review.planGeneration.modelUsed} · ${review.planGeneration.costUSD.toFixed(4)} USD
            </p>
            {review.flagsDetectados.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end">
                {review.flagsDetectados.map((f) => (
                  <span key={f} className="text-xs bg-red-900/20 border border-red-800/50 text-red-400 px-1.5 py-0.5 rounded">
                    {f.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mensajes */}
        {msgExito && (
          <div className="mb-4 bg-green-900/30 border border-green-700 text-green-300 rounded-lg px-4 py-3 text-sm">
            {msgExito}
          </div>
        )}
        {msgError && (
          <div className="mb-4 bg-red-900/30 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
            {msgError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Panel izquierdo: plan */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-4 border-b border-[#222]">
              {([
                { key: 'resumen', label: 'Resumen' },
                { key: 'entrenamiento', label: 'Entrenamiento' },
                { key: 'nutricion', label: 'Nutrición' },
                { key: 'suplementacion', label: 'Suplementación' },
                { key: 'editor', label: '{ } Editor' },
              ] as { key: Tab; label: string }[]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`pb-2 px-3 text-xs font-medium border-b-2 -mb-px transition-colors ${
                    tab === t.key
                      ? 'border-[#C9A84C] text-[#C9A84C]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Contenido tabs */}
            <div className="bg-[#0e0e0c] border border-[#222] rounded-xl p-5 text-sm min-h-[400px]">

              {tab === 'resumen' && plan.resumenEjecutivo && (
                <div className="space-y-4">
                  <p className="text-gray-300 leading-relaxed">{plan.resumenEjecutivo.objetivo}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Calorías', value: `${plan.resumenEjecutivo.caloriesDiarias} kcal` },
                      { label: 'Proteína', value: `${plan.resumenEjecutivo.macros?.proteinaG}g` },
                      { label: 'Carbos', value: `${plan.resumenEjecutivo.macros?.carbosG}g` },
                      { label: 'Grasas', value: `${plan.resumenEjecutivo.macros?.grasaG}g` },
                      { label: 'Hidratación', value: `${plan.resumenEjecutivo.hidratacionL}L` },
                      { label: 'Días entreno', value: plan.resumenEjecutivo.diasEntrenamiento },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#111] rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                        <p className="font-semibold text-[#C9A84C]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                  {plan.resumenEjecutivo.volumenSemanalResumen && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Volumen semanal</p>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {Object.entries(plan.resumenEjecutivo.volumenSemanalResumen).map(([grupo, series]) => (
                          <div key={grupo} className="bg-[#111] rounded p-2 text-xs">
                            <p className="text-gray-400 capitalize">{grupo}</p>
                            <p className="text-white font-medium">{series} series</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'entrenamiento' && plan.planEntrenamiento && (
                <div className="space-y-6">
                  <div className="bg-[#111] rounded-lg p-3 text-xs text-gray-400 space-y-1">
                    <p>Intensidad: {plan.planEntrenamiento.parametrosGlobales?.intensidadPct1RM}</p>
                    <p>RIR: {plan.planEntrenamiento.parametrosGlobales?.rirObjetivo}</p>
                    <p>Progresión: {plan.planEntrenamiento.parametrosGlobales?.progresionSemanal}</p>
                    <p className="text-gray-600">Ref: {plan.planEntrenamiento.parametrosGlobales?.referenciaCientifica}</p>
                  </div>

                  {plan.planEntrenamiento.distribucionSemanal?.map((dia) => (
                    <div key={dia.dia} className="border border-[#222] rounded-lg overflow-hidden">
                      <div className="bg-[#111] px-4 py-2 flex items-center justify-between">
                        <span className="font-medium text-[#C9A84C]">{dia.nombre}</span>
                        <span className="text-xs text-gray-500">{dia.duracionEstimadaMin} min · {dia.gruposObjetivo?.join(', ')}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b border-[#222]">
                              {['Ejercicio', 'Grupos', 'Series', 'Reps', 'RIR', 'Descanso'].map((h) => (
                                <th key={h} className="text-left px-3 py-2 font-normal">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1a1a1a]">
                            {dia.ejercicios?.map((ej, i) => (
                              <tr key={i} className="hover:bg-[#111]">
                                <td className="px-3 py-2">
                                  <p className="font-medium">{ej.nombre}</p>
                                  {ej.tecnicaNotas && <p className="text-gray-600 text-xs">{ej.tecnicaNotas}</p>}
                                  {ej.alertas && ej.alertas.length > 0 && (
                                    <p className="text-red-400 text-xs">⚠ {ej.alertas.join('; ')}</p>
                                  )}
                                  {ej.sustitutoEnCasa && <p className="text-blue-400 text-xs">Casa: {ej.sustitutoEnCasa}</p>}
                                </td>
                                <td className="px-3 py-2 text-gray-400">{ej.grupoMuscular}</td>
                                <td className="px-3 py-2">{ej.series}</td>
                                <td className="px-3 py-2">{ej.repeticiones}</td>
                                <td className="px-3 py-2">{ej.rir}</td>
                                <td className="px-3 py-2 text-gray-400">{ej.descansoSeg}s</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-2 text-xs text-gray-600">
                        Vuelta a la calma: {dia.vuelta_a_la_calma?.join(' · ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === 'nutricion' && plan.planNutricional && (
                <div className="space-y-5">
                  <p className="text-gray-300">{plan.planNutricional.estrategiaCalorica}</p>
                  <p className="text-sm text-gray-400">{plan.planNutricional.timingPeriEntrenamiento}</p>

                  {plan.planNutricional.ejemploDiaTipo?.map((comida) => (
                    <div key={comida.comida} className="border border-[#222] rounded-lg overflow-hidden">
                      <div className="bg-[#111] px-4 py-2 flex items-center justify-between">
                        <span className="font-medium text-[#C9A84C]">{comida.comida}</span>
                        <span className="text-xs text-gray-500">{comida.hora}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500 border-b border-[#222]">
                              {['Alimento', 'g', 'Prot', 'Carbs', 'Grasas', 'kcal'].map((h) => (
                                <th key={h} className="text-left px-3 py-2 font-normal">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1a1a1a]">
                            {comida.ingredientes?.map((ing, i) => (
                              <tr key={i}>
                                <td className="px-3 py-2">{ing.nombre}</td>
                                <td className="px-3 py-2 text-gray-400">{ing.cantidadG}</td>
                                <td className="px-3 py-2">{ing.proteinaG}g</td>
                                <td className="px-3 py-2">{ing.carbosG}g</td>
                                <td className="px-3 py-2">{ing.grasaG}g</td>
                                <td className="px-3 py-2 text-[#C9A84C]">{ing.kcal}</td>
                              </tr>
                            ))}
                            <tr className="bg-[#111] font-semibold">
                              <td className="px-3 py-2 text-gray-400">TOTAL</td>
                              <td className="px-3 py-2"></td>
                              <td className="px-3 py-2">{comida.totalesComida?.proteinaG}g</td>
                              <td className="px-3 py-2">{comida.totalesComida?.carbosG}g</td>
                              <td className="px-3 py-2">{comida.totalesComida?.grasaG}g</td>
                              <td className="px-3 py-2 text-[#C9A84C]">{comida.totalesComida?.kcal}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  {plan.planNutricional.listaCompras && plan.planNutricional.listaCompras.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Lista de compras</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {plan.planNutricional.listaCompras.map((cat) => (
                          <div key={cat.categoria} className="bg-[#111] rounded-lg p-3">
                            <p className="text-xs text-[#C9A84C] font-medium mb-1">{cat.categoria}</p>
                            <p className="text-xs text-gray-400">{cat.items?.join(', ')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'suplementacion' && plan.planNutricional?.suplementacion && (
                <div className="space-y-3">
                  {plan.planNutricional.suplementacion.length === 0 ? (
                    <p className="text-gray-500">Sin suplementación recomendada.</p>
                  ) : (
                    plan.planNutricional.suplementacion.map((s, i) => (
                      <div key={i} className="bg-[#111] border border-[#222] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-[#C9A84C]">{s.nombre}</span>
                          <span className="text-xs bg-[#1a1a1a] border border-[#333] px-2 py-1 rounded">{s.dosis}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-1">Timing: {s.timing}</p>
                        <p className="text-xs text-gray-600">{s.evidencia}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === 'editor' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Editá el JSON del plan directamente. Los cambios se guardan antes de aprobar.</p>
                    {!jsonValido && <span className="text-xs text-red-400">JSON inválido</span>}
                  </div>
                  <textarea
                    value={planEditado}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className={`w-full h-[420px] bg-[#0a0a08] border rounded-lg p-3 text-xs font-mono text-gray-300 resize-none focus:outline-none ${
                      jsonValido ? 'border-[#333] focus:border-[#C9A84C]' : 'border-red-700'
                    }`}
                    spellCheck={false}
                  />
                  <button
                    onClick={guardarCambios}
                    disabled={!jsonValido || guardando}
                    className="bg-[#222] hover:bg-[#333] disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {guardando ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho: acciones */}
          <div className="space-y-4">

            {/* Proofreader report */}
            {review.proofreaderReportJson != null && (
              <div className="bg-[#0e0e0c] border border-[#222] rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Reporte Proofreader</p>
                <pre className="text-xs text-gray-400 overflow-auto max-h-48 whitespace-pre-wrap">
                  {JSON.stringify(review.proofreaderReportJson as object, null, 2)}
                </pre>
              </div>
            )}

            {/* Acciones — solo si está PENDIENTE */}
            {esPendiente && (
              <>
                {/* Notas del trainer */}
                <div className="bg-[#0e0e0c] border border-[#222] rounded-xl p-4">
                  <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">
                    Notas del trainer (opcional)
                  </label>
                  <textarea
                    value={notasTrainer}
                    onChange={(e) => setNotasTrainer(e.target.value)}
                    placeholder="Notas adicionales para el cliente…"
                    className="w-full bg-[#0a0a08] border border-[#333] rounded-lg p-3 text-sm text-gray-300 resize-none h-20 focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                {/* Aprobar */}
                <button
                  onClick={aprobar}
                  disabled={aprobando}
                  className="w-full bg-[#C9A84C] hover:bg-[#b8943d] disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors"
                >
                  {aprobando ? 'Aprobando…' : '✓ Aprobar y enviar'}
                </button>

                {/* Motivo rechazo */}
                <div className="bg-[#0e0e0c] border border-[#222] rounded-xl p-4 space-y-3">
                  <label className="text-xs text-gray-500 uppercase tracking-wider block">
                    Motivo (para rechazar o regenerar)
                  </label>
                  <textarea
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                    placeholder="Describí el problema…"
                    className="w-full bg-[#0a0a08] border border-[#333] rounded-lg p-3 text-sm text-gray-300 resize-none h-20 focus:outline-none focus:border-[#C9A84C]"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={rechazar}
                      disabled={rechazando}
                      className="bg-[#1a1a1a] hover:bg-red-900/30 border border-[#333] hover:border-red-700 disabled:opacity-50 text-gray-300 hover:text-red-300 text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={regenerar}
                      disabled={rechazando}
                      className="bg-[#1a1a1a] hover:bg-blue-900/30 border border-[#333] hover:border-blue-700 disabled:opacity-50 text-gray-300 hover:text-blue-300 text-sm font-medium py-2 rounded-lg transition-colors"
                    >
                      Regenerar
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Estado final */}
            {!esPendiente && (
              <div className="bg-[#0e0e0c] border border-[#222] rounded-xl p-4 text-sm">
                <p className="text-gray-500 mb-2">
                  {review.estado === 'APROBADO' ? '✓ Aprobado' : '✗ Rechazado'}
                  {review.aprobadoAt && ` · ${new Date(review.aprobadoAt).toLocaleDateString('es-AR')}`}
                </p>
                {review.estado === 'APROBADO' && review.entregadoAt && (
                  <p className="text-xs text-gray-600">
                    Entregado: {new Date(review.entregadoAt).toLocaleDateString('es-AR')}
                  </p>
                )}
              </div>
            )}

            {/* Auditoría */}
            {review.modificacionesJson != null && (
              <details className="bg-[#0e0e0c] border border-[#222] rounded-xl">
                <summary className="px-4 py-3 text-xs text-gray-500 cursor-pointer uppercase tracking-wider">
                  Auditoría
                </summary>
                <pre className="px-4 pb-4 text-xs text-gray-600 overflow-auto max-h-48 whitespace-pre-wrap">
                  {JSON.stringify(review.modificacionesJson as object, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
