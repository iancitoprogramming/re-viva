'use client'

// Ficha de un alta. Tres bloques, en este orden: alertas, prompt de armado y
// datos crudos. Las alertas y el prompt se calculan al vuelo en el servidor:
// nada de eso se guarda.

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ESTADOS_ALTA, ETIQUETA_ESTADO } from '@/lib/ingreso'
import type { Alerta } from '@/lib/ficha'

interface Respuesta {
  alta: {
    id: string
    nombre: string
    email: string
    whatsapp: string
    creadoEn: string
    estado: string
    notasInternas: string | null
  }
  alertas: Alerta[]
  prompt: string
  tmb: number | null
  crudos: { paso: string; filas: [string, string][] }[]
}

const CLASE_ALERTA: Record<string, string> = {
  stop:  'bg-red-50 text-red-800 border-red-200',
  ok:    'bg-primary/10 text-primary border-primary/20',
  aviso: 'bg-surface-warm text-ink border-edge',
}

export default function AltaDetallePage() {
  const router = useRouter()
  const { id }  = useParams<{ id: string }>()

  const [data, setData]       = useState<Respuesta | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [notas, setNotas]     = useState('')
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado]   = useState('')
  const [copiado, setCopiado]     = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
  }, [router])

  useEffect(() => {
    let vivo = true
    void (async () => {
      const r = await fetch(`/api/admin/altas/${id}`)
      if (r.status === 401 || r.status === 403) { router.push('/login'); return }
      if (!vivo) return
      if (r.status === 404) { setNotFound(true); setLoading(false); return }
      const d: Respuesta = await r.json()
      if (!vivo) return
      setData(d)
      setNotas(d.alta.notasInternas ?? '')
      setLoading(false)
    })()
    return () => { vivo = false }
  }, [id, router])

  async function guardar(cambios: { estado?: string; notasInternas?: string }) {
    setGuardando(true)
    setGuardado('')
    const r = await fetch(`/api/admin/altas/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cambios),
    })
    setGuardando(false)
    if (!r.ok) { setGuardado('No se pudo guardar.'); return }
    const d = await r.json()
    setData(prev => (prev ? { ...prev, alta: { ...prev.alta, ...d.alta } } : prev))
    setGuardado('Guardado')
    setTimeout(() => setGuardado(''), 1800)
  }

  async function copiar() {
    if (!data) return
    try {
      await navigator.clipboard.writeText(data.prompt)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 1800)
    } catch {
      setCopiado(false)
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-ivory">
        <Navbar nombreUsuario={nombreAdmin} esAdmin />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-sm text-ink-muted">Esa alta no existe.</p>
          <Link href="/admin/altas" className="mt-3 inline-block text-sm text-primary">← Volver a las altas</Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link href="/admin/altas" className="text-sm text-ink-muted transition-colors hover:text-primary">
          ← Altas
        </Link>

        {loading || !data ? (
          <p className="mt-6 text-sm text-ink-muted">Cargando…</p>
        ) : (
          <>
            {/* ── Encabezado ── */}
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="font-serif text-2xl text-ink">{data.alta.nombre}</h1>
                <p className="mt-1 text-sm text-ink-secondary">
                  {data.alta.whatsapp} · {data.alta.email}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Recibida el {new Date(data.alta.creadoEn).toLocaleDateString('es-AR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {data.tmb ? ` · TMB ${data.tmb} kcal` : ''}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <select
                  value={data.alta.estado}
                  onChange={ev => void guardar({ estado: ev.target.value })}
                  disabled={guardando}
                  aria-label="Estado del alta"
                  className="rounded-xl border border-edge bg-surface px-3 py-2 text-sm text-ink"
                >
                  {ESTADOS_ALTA.map(es => (
                    <option key={es} value={es}>{ETIQUETA_ESTADO[es]}</option>
                  ))}
                </select>
                {guardado && <span className="text-xs text-ink-muted">{guardado}</span>}
              </div>
            </div>

            {/* ── 1. Alertas ── */}
            <h2 className="mt-8 border-t border-edge pt-6 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-muted">
              Alertas
            </h2>
            <div className="mt-3 flex flex-col gap-2">
              {data.alertas.map((a, i) => (
                <div
                  key={i}
                  className={`rounded-xl border px-4 py-3 text-sm leading-relaxed ${CLASE_ALERTA[a.tipo] ?? CLASE_ALERTA.aviso}`}
                >
                  {a.texto}
                </div>
              ))}
            </div>

            {/* ── 2. Prompt de armado ── */}
            <h2 className="mt-8 border-t border-edge pt-6 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-muted">
              Prompt de armado
            </h2>
            <p className="mt-2 text-[13px] text-ink-secondary">
              Este bloque es lo que copiás a la terminal para que el agente arranque el plan. Se arma
              solo con lo que respondió el cliente.
            </p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-2xl border border-edge bg-surface p-4 font-mono text-[12.5px] leading-relaxed text-ink">
              {data.prompt}
            </pre>
            <button
              type="button" onClick={copiar}
              className="mt-3 rounded-xl border border-edge bg-surface px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:border-gold/50"
            >
              {copiado ? 'Copiado' : 'Copiar prompt'}
            </button>

            {/* ── 3. Datos crudos ── */}
            <h2 className="mt-8 border-t border-edge pt-6 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-muted">
              Datos crudos
            </h2>
            <div className="mt-3 flex flex-col gap-5">
              {data.crudos.map(grupo => (
                <div key={grupo.paso} className="rounded-2xl border border-edge bg-surface p-4">
                  <p className="mb-2 text-sm font-bold text-ink">{grupo.paso}</p>
                  <dl className="divide-y divide-edge/70 text-sm">
                    {grupo.filas.map(([k, v]) => (
                      <div key={k} className="flex gap-4 py-1.5">
                        <dt className="w-[45%] shrink-0 text-ink-secondary">{k}</dt>
                        <dd className="min-w-0 whitespace-pre-wrap break-words text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>

            {/* ── Notas internas ── */}
            <h2 className="mt-8 border-t border-edge pt-6 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-muted">
              Notas internas
            </h2>
            <textarea
              value={notas}
              onChange={ev => setNotas(ev.target.value)}
              rows={4}
              placeholder="Lo que quieras recordar de este alta. No lo ve el cliente."
              className="mt-3 w-full resize-y rounded-xl border border-edge bg-surface-warm px-4 py-3 text-sm text-ink transition-colors focus:bg-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
            <button
              type="button" onClick={() => void guardar({ notasInternas: notas })} disabled={guardando}
              className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {guardando ? 'Guardando…' : 'Guardar notas'}
            </button>
          </>
        )}
      </main>
    </div>
  )
}
