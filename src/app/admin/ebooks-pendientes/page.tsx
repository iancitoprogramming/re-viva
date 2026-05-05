'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { WHATSAPP_NUMBER, PLAN_LABELS } from '@/lib/constants'

interface Entrega {
  id: string
  userId: string
  planTipo: string
  estado: 'PENDIENTE' | 'ENTREGADO'
  creadoEn: string
  entregadoEn: string | null
  notas: string | null
  cliente: { nombre: string; email: string }
  pago:    { amount: number; paymentId: string | null; fecha: string }
}

export default function EbooksPendientesPage() {
  const router = useRouter()
  const [items, setItems] = useState<Entrega[]>([])
  const [loading, setLoading] = useState(true)
  const [verEntregados, setVerEntregados] = useState(false)
  const [resolviendo, setResolviendo] = useState<string | null>(null)
  const [notas, setNotas] = useState<Record<string, string>>({})
  const [nombreAdmin, setNombreAdmin] = useState('')

  async function cargar() {
    setLoading(true)
    const r = await fetch(`/api/admin/ebooks-pendientes${verEntregados ? '?incluirEntregados=1' : ''}`)
    if (r.status === 401 || r.status === 403) { router.push('/login'); return }
    const d = await r.json()
    setItems(d.items ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verEntregados])

  async function marcarEntregado(id: string) {
    setResolviendo(id)
    const r = await fetch(`/api/admin/ebooks/${id}/entregar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas: notas[id]?.trim() || undefined }),
    })
    setResolviendo(null)
    if (r.ok) await cargar()
    else alert('No se pudo marcar como entregado.')
  }

  async function deshacerEntrega(id: string) {
    if (!confirm('¿Volver a marcar como pendiente?')) return
    const r = await fetch(`/api/admin/ebooks/${id}/entregar`, { method: 'DELETE' })
    if (r.ok) await cargar()
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl text-ink">Entregas de ebooks/cursos</h1>
            <p className="text-ink-muted text-sm mt-0.5">
              Compras confirmadas por Mercado Pago. Enviá el PDF por WhatsApp y marcá entregado.
            </p>
          </div>
          <Link href="/admin" className="text-sm text-ink-muted hover:text-primary transition-colors">
            ← Panel
          </Link>
        </div>

        {/* Toggle pendientes/todos */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setVerEntregados(false)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${!verEntregados ? 'bg-primary text-ivory' : 'bg-surface border border-edge text-ink-muted hover:text-ink'}`}
          >
            Solo pendientes
          </button>
          <button
            onClick={() => setVerEntregados(true)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${verEntregados ? 'bg-primary text-ivory' : 'bg-surface border border-edge text-ink-muted hover:text-ink'}`}
          >
            Ver todas
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-ink-muted">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-ink-muted bg-surface rounded-2xl border border-edge">
            <p className="text-3xl mb-2">📦</p>
            <p>No hay entregas {verEntregados ? '' : 'pendientes'}.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(it => {
              const titulo = PLAN_LABELS[it.planTipo] ?? it.planTipo
              const wpp = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${it.cliente.nombre.split(' ')[0]}, soy Ian. Recibí tu pago del ${titulo}. Te paso el PDF por acá.`)}`
              const esEntregado = it.estado === 'ENTREGADO'
              return (
                <div key={it.id} className={`bg-surface rounded-2xl border p-5 shadow-sm ${esEntregado ? 'border-edge opacity-70' : 'border-primary/30'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide mb-1.5 ${esEntregado ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                        {esEntregado ? 'Entregado' : 'Pendiente'}
                      </span>
                      <p className="font-semibold text-ink">{titulo}</p>
                      <p className="text-sm text-ink-secondary mt-0.5">{it.cliente.nombre}</p>
                      <p className="text-xs text-ink-muted truncate">{it.cliente.email}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Pagó ${it.pago.amount.toLocaleString('es-AR')} · {new Date(it.pago.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {esEntregado && it.entregadoEn && (
                        <p className="text-xs text-emerald-700 mt-1">
                          Entregado el {new Date(it.entregadoEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                      {it.notas && (
                        <p className="text-xs text-ink-secondary mt-2 italic bg-surface-warm border border-edge rounded-lg px-2 py-1">
                          📝 {it.notas}
                        </p>
                      )}
                    </div>
                    <a
                      href={wpp}
                      target="_blank"
                      rel="noopener"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <span>💬</span> Abrir WhatsApp
                    </a>
                  </div>

                  {!esEntregado && (
                    <>
                      <textarea
                        value={notas[it.id] ?? ''}
                        onChange={e => setNotas(n => ({ ...n, [it.id]: e.target.value }))}
                        placeholder="Notas (opcional). Ej: 'Enviado el 30/4 a las 18:00 por WhatsApp'"
                        className="w-full text-sm border border-edge rounded-xl px-3 py-2 mb-3 bg-surface-warm focus:bg-surface focus:outline-none focus:border-primary resize-none"
                        rows={2}
                      />
                      <button
                        onClick={() => marcarEntregado(it.id)}
                        disabled={resolviendo === it.id}
                        className="w-full bg-primary hover:bg-primary-dark text-ivory text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-60"
                      >
                        {resolviendo === it.id ? 'Marcando…' : '✓ Marcar como entregado'}
                      </button>
                    </>
                  )}

                  {esEntregado && (
                    <button
                      onClick={() => deshacerEntrega(it.id)}
                      className="w-full text-xs text-ink-muted hover:text-red-600 transition-colors py-1"
                    >
                      Deshacer entrega
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
