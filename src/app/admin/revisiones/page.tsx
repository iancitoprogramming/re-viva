'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface ReviewItem {
  id: string
  clienteNombre: string
  clienteEmail: string
  prioridad: 'alta' | 'media' | 'baja'
  estado: string
  proofreaderStatus: string | null
  requiereRevisionManual: boolean
  flagsDetectados: string[]
  observacionesCount: number
  modelUsed: string
  costUSD: number
  creadoEn: string
  aprobadoAt: string | null
  entregadoAt: string | null
}

interface Stats {
  totalPendiente: number
  totalAlta: number
  totalAprobado: number
  totalRechazado: number
}

const PRIORIDAD_LABEL: Record<string, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

const PRIORIDAD_COLOR: Record<string, string> = {
  alta: 'bg-red-900/40 text-red-300 border border-red-700',
  media: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700',
  baja: 'bg-green-900/40 text-green-300 border border-green-700',
}

const PROOFREADER_COLOR: Record<string, string> = {
  aprobado: 'bg-green-900/40 text-green-300 border border-green-700',
  aprobado_con_observaciones: 'bg-yellow-900/40 text-yellow-300 border border-yellow-700',
  rechazado: 'bg-red-900/40 text-red-300 border border-red-700',
}

const ESTADO_TABS = [
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'APROBADO', label: 'Aprobados' },
  { value: 'RECHAZADO', label: 'Rechazados' },
]

export default function RevisionesPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [estadoFiltro, setEstadoFiltro] = useState('PENDIENTE')
  const [loading, setLoading] = useState(true)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/reviews?estado=${estadoFiltro}`, { credentials: 'include' })
      if (res.status === 401 || res.status === 403) { router.push('/login'); return }
      const data = await res.json()
      setReviews(data.reviews ?? [])
      setStats(data.stats ?? null)
    } finally {
      setLoading(false)
    }
  }, [estadoFiltro, router])

  useEffect(() => { cargar() }, [cargar])

  return (
    <div className="min-h-screen bg-[#0a0a08] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#C9A84C]">Cola de Revisiones</h1>
            <p className="text-sm text-gray-400 mt-1">Planes generados por IA esperando aprobación</p>
          </div>
          <Link
            href="/admin"
            className="text-sm text-gray-400 hover:text-[#C9A84C] transition-colors"
          >
            ← Volver al panel
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Pendientes', value: stats.totalPendiente, color: 'text-white' },
              { label: 'Alta prioridad', value: stats.totalAlta, color: 'text-red-400' },
              { label: 'Aprobados', value: stats.totalAprobado, color: 'text-green-400' },
              { label: 'Rechazados', value: stats.totalRechazado, color: 'text-gray-400' },
            ].map((s) => (
              <div key={s.label} className="bg-[#111] border border-[#222] rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
                <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#222]">
          {ESTADO_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setEstadoFiltro(tab.value)}
              className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                estadoFiltro === tab.value
                  ? 'border-[#C9A84C] text-[#C9A84C]'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.value === 'PENDIENTE' && stats && stats.totalPendiente > 0 && (
                <span className="ml-2 bg-[#C9A84C] text-black text-xs rounded-full px-1.5 py-0.5">
                  {stats.totalPendiente}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Cargando…</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No hay revisiones en estado &quot;{estadoFiltro}&quot;
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-[#222]">
                  <th className="pb-3 pr-4">Cliente</th>
                  <th className="pb-3 pr-4">Prioridad</th>
                  <th className="pb-3 pr-4">Proofreader</th>
                  <th className="pb-3 pr-4">Flags</th>
                  <th className="pb-3 pr-4">Obs.</th>
                  <th className="pb-3 pr-4">Costo</th>
                  <th className="pb-3 pr-4">Fecha</th>
                  <th className="pb-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a1a1a]">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-[#111] transition-colors">
                    <td className="py-4 pr-4">
                      <p className="font-medium">{r.clienteNombre}</p>
                      <p className="text-xs text-gray-500">{r.clienteEmail}</p>
                      {r.requiereRevisionManual && (
                        <span className="text-xs text-red-400">⚠ revisión obligatoria</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${PRIORIDAD_COLOR[r.prioridad] ?? ''}`}>
                        {PRIORIDAD_LABEL[r.prioridad] ?? r.prioridad}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      {r.proofreaderStatus ? (
                        <span className={`text-xs px-2 py-1 rounded-full ${PROOFREADER_COLOR[r.proofreaderStatus] ?? 'bg-gray-800 text-gray-400'}`}>
                          {r.proofreaderStatus.replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">pendiente</span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {r.flagsDetectados.slice(0, 2).map((f) => (
                          <span key={f} className="text-xs bg-[#1a1a1a] border border-[#333] px-1.5 py-0.5 rounded">
                            {f.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {r.flagsDetectados.length > 2 && (
                          <span className="text-xs text-gray-500">+{r.flagsDetectados.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-center">
                      {r.observacionesCount > 0 ? (
                        <span className="text-yellow-400">{r.observacionesCount}</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="py-4 pr-4 text-gray-400 text-xs">
                      ${r.costUSD.toFixed(4)}
                    </td>
                    <td className="py-4 pr-4 text-gray-400 text-xs">
                      {new Date(r.creadoEn).toLocaleDateString('es-AR')}
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/admin/revisiones/${r.id}`}
                        className="bg-[#C9A84C] hover:bg-[#b8943d] text-black text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {r.estado === 'PENDIENTE' ? 'Revisar' : 'Ver'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
