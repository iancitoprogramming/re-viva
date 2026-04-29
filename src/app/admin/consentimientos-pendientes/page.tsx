'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { WHATSAPP_NUMBER } from '@/lib/constants'

interface Item {
  userId: string
  nombre: string
  email: string
  onboardingEn: string
  consentimientos: {
    aceptaTerminosYCondiciones: boolean
    aceptaPoliticaPrivacidad: boolean
    aceptaDescargoMedicoYResponsabilidad: boolean
    confirmaVeracidadDatos: boolean
  }
}

const LABELS: Record<keyof Item['consentimientos'], string> = {
  aceptaTerminosYCondiciones:           'Términos y Condiciones',
  aceptaPoliticaPrivacidad:             'Política de Privacidad',
  aceptaDescargoMedicoYResponsabilidad: 'Descargo médico',
  confirmaVeracidadDatos:               'Veracidad de datos',
}

export default function ConsentimientosPendientesPage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [resolviendo, setResolviendo] = useState<string | null>(null)
  const [notas, setNotas] = useState<Record<string, string>>({})

  async function cargar() {
    setLoading(true)
    const r = await fetch('/api/admin/consentimientos-pendientes')
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
  }, [])

  async function marcarRevisado(userId: string) {
    setResolviendo(userId)
    const r = await fetch(`/api/admin/cliente/${userId}/consentimientos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas: notas[userId]?.trim() || undefined }),
    })
    setResolviendo(null)
    if (r.ok) {
      await cargar()
    } else {
      alert('No se pudo marcar como revisado.')
    }
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl text-ink">Consentimientos pendientes</h1>
            <p className="text-ink-muted text-sm mt-0.5">
              Clientes que NO aceptaron todos los consentimientos legales online.
              Hablá con cada uno en persona o por videollamada y marcá como revisado.
            </p>
          </div>
          <Link href="/admin" className="text-sm text-ink-muted hover:text-primary transition-colors">
            ← Panel
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-ink-muted">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-ink-muted bg-surface rounded-2xl border border-edge">
            <p className="text-3xl mb-2">✓</p>
            <p>No hay consentimientos pendientes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(it => {
              const wpp = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${it.nombre.split(' ')[0]}, soy de Re-Viva. Antes de armarte el plan necesitamos charlar 5 min sobre los consentimientos legales que dejaste sin marcar en el formulario. ¿Cuándo te queda bien?`)}`
              return (
                <div key={it.userId} className="bg-surface rounded-2xl border border-edge p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{it.nombre}</p>
                      <p className="text-sm text-ink-muted truncate">{it.email}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        Onboarding: {new Date(it.onboardingEn).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <a
                      href={wpp}
                      target="_blank"
                      rel="noopener"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 flex-shrink-0"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  </div>

                  {/* Estado de cada consentimiento */}
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    {(Object.keys(LABELS) as Array<keyof Item['consentimientos']>).map(k => (
                      <div key={k} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${it.consentimientos[k] ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <span>{it.consentimientos[k] ? '✓' : '✗'}</span>
                        <span className="truncate">{LABELS[k]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Input de notas + botón */}
                  <textarea
                    value={notas[it.userId] ?? ''}
                    onChange={e => setNotas(n => ({ ...n, [it.userId]: e.target.value }))}
                    placeholder="Notas de la charla (opcional). Ej: 'Hablado por videollamada el 28/4. Dudas resueltas, acepta todo.'"
                    className="w-full text-sm border border-edge rounded-xl px-3 py-2 mb-3 bg-surface-warm focus:bg-surface focus:outline-none focus:border-primary resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Link href={`/admin/cliente/${it.userId}`}
                      className="flex-1 text-center bg-surface border border-edge text-ink-secondary text-xs font-semibold px-3 py-2 rounded-xl hover:border-primary/40 transition-colors">
                      Ver perfil completo
                    </Link>
                    <button
                      onClick={() => marcarRevisado(it.userId)}
                      disabled={resolviendo === it.userId}
                      className="flex-1 bg-primary hover:bg-primary-dark text-ivory text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {resolviendo === it.userId ? 'Marcando…' : '✓ Revisado en persona'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
