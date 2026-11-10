'use client'

// Débito automático de Mercado Pago.
//   modo "alta"   → /pendiente: pide el mail de MP y manda a autorizar.
//   modo "estado" → /dashboard: muestra la suscripción vigente y permite darla de baja.

import { useEffect, useState } from 'react'

interface Suscripcion {
  planTipo: string
  monto: number
  estado: string
  proximoCobro: string | null
}

const pesos = (n: number) => `$${n.toLocaleString('es-AR')}`

export function AltaDebitoAutomatico({ planTipo, linkAlternativo }: { planTipo: string; linkAlternativo?: string | null }) {
  const [email, setEmail] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => (r.ok ? r.json() : null)).then(d => { if (d?.email) setEmail(d.email) }).catch(() => null)
  }, [])

  async function suscribir(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    try {
      const r = await fetch('/api/payments/suscripcion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planTipo, payerEmail: email }),
      })
      const data = await r.json()
      if (r.status === 401) { window.location.href = `/login?redirect=${encodeURIComponent(`/pendiente?plan=${planTipo}`)}`; return }
      if (!r.ok) throw new Error(data.error ?? 'No se pudo iniciar el débito automático.')
      window.location.href = data.initPoint
    } catch (err) {
      setError((err as Error).message)
      setEnviando(false)
    }
  }

  if (!abierto) {
    return (
      <>
        <button
          onClick={() => setAbierto(true)}
          className="w-full flex items-center justify-between bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-4 rounded-2xl font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer mb-2 text-left"
        >
          <span>Suscribirme con débito automático</span>
          <span className="text-xs font-normal opacity-80">Mercado Pago · cancelás cuando quieras</span>
        </button>
        <p className="text-xs text-gray-500 text-center mb-4">
          Se renueva solo. Así no cortás el proceso por olvidarte de pagar.
        </p>
      </>
    )
  }

  return (
    <form onSubmit={suscribir} className="bg-white border border-emerald-200 rounded-2xl p-5 mb-4">
      <label htmlFor="mp-email" className="block text-sm font-semibold text-gray-900 mb-1">
        ¿Con qué mail entrás a Mercado Pago?
      </label>
      <p className="text-xs text-gray-500 mb-3">Tiene que ser el de la cuenta con la que vas a pagar.</p>
      <input
        id="mp-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:border-emerald-600"
      />
      <button
        type="submit"
        disabled={enviando}
        className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white px-6 py-3.5 rounded-xl font-semibold transition-all cursor-pointer"
      >
        {enviando ? 'Abriendo Mercado Pago…' : 'Continuar en Mercado Pago'}
      </button>
      {error && (
        <p className="text-sm text-red-600 mt-3">
          {error}{' '}
          {linkAlternativo && (
            <a href={linkAlternativo} target="_blank" rel="noopener noreferrer" className="underline">
              Probá con este link.
            </a>
          )}
        </p>
      )}
    </form>
  )
}

export function EstadoDebitoAutomatico() {
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null)
  const [confirmando, setConfirmando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  useEffect(() => {
    fetch('/api/payments/suscripcion').then(r => (r.ok ? r.json() : null)).then(d => setSuscripcion(d?.suscripcion ?? null)).catch(() => null)
  }, [])

  async function cancelar() {
    setMensaje('')
    const r = await fetch('/api/payments/suscripcion', { method: 'DELETE' })
    const data = await r.json().catch(() => ({}))
    if (!r.ok) { setMensaje(data.error ?? 'No se pudo cancelar.'); return }
    setSuscripcion(null)
    setMensaje('Débito automático cancelado. Tu plan sigue activo hasta el vencimiento.')
  }

  if (!suscripcion) return mensaje ? <p className="text-xs text-ink-muted mb-4">{mensaje}</p> : null

  return (
    <div className="bg-surface rounded-2xl border border-edge shadow-sm p-5 mb-4">
      <p className="text-sm font-bold text-ink mb-1">Débito automático {suscripcion.estado === 'paused' ? 'pausado' : 'activo'}</p>
      <p className="text-xs text-ink-muted mb-3">
        {pesos(suscripcion.monto)} por Mercado Pago
        {suscripcion.proximoCobro && suscripcion.estado !== 'paused'
          ? ` · próximo cobro el ${new Date(suscripcion.proximoCobro).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}`
          : ''}
      </p>
      {confirmando ? (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-ink">¿Seguro? No se te vuelve a cobrar.</span>
          <button onClick={cancelar} className="text-red-600 font-semibold underline cursor-pointer">Sí, cancelar</button>
          <button onClick={() => setConfirmando(false)} className="text-ink-muted underline cursor-pointer">No</button>
        </div>
      ) : (
        <button onClick={() => setConfirmando(true)} className="text-xs text-ink-muted underline cursor-pointer">
          Cancelar débito automático
        </button>
      )}
      {mensaje && <p className="text-xs text-red-600 mt-2">{mensaje}</p>}
    </div>
  )
}
