'use client'

// Lista de altas del formulario público /ingreso. Más nueva arriba.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ESTADOS_ALTA, ETIQUETA_ESTADO } from '@/lib/ingreso'

interface AltaFila {
  id: string
  nombre: string
  creadoEn: string
  estado: string
  objetivo: string
  dias: number
}

const CLASE_ESTADO: Record<string, string> = {
  nuevo:      'bg-gold-light text-ink border-gold/40',
  en_armado:  'bg-amber-100 text-amber-800 border-amber-300',
  armado:     'bg-primary/10 text-primary border-primary/20',
  descartado: 'bg-surface-warm text-ink-muted border-edge',
}

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function AltasPage() {
  const router = useRouter()
  const [altas, setAltas]     = useState<AltaFila[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro]   = useState('')
  const [nombreAdmin, setNombreAdmin] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
  }, [router])

  useEffect(() => {
    let vivo = true
    void (async () => {
      const r = await fetch(`/api/admin/altas${filtro ? `?estado=${filtro}` : ''}`)
      if (r.status === 401 || r.status === 403) { router.push('/login'); return }
      const d = await r.json()
      if (!vivo) return
      setAltas(d.altas ?? [])
      setLoading(false)
    })()
    return () => { vivo = false }
  }, [filtro, router])

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-ink">Altas de ingreso</h1>
            <p className="mt-0.5 text-sm text-ink-muted">
              Formularios recibidos en revivabyigz.com/ingreso. Abrí una para ver la ficha y el prompt de armado.
            </p>
          </div>
          <Link href="/admin" className="shrink-0 text-sm text-ink-muted transition-colors hover:text-primary">
            ← Panel
          </Link>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            type="button" onClick={() => setFiltro('')} aria-pressed={filtro === ''}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              filtro === '' ? 'border-ink bg-ink text-ivory' : 'border-edge bg-surface text-ink-secondary hover:border-ink/40'
            }`}
          >
            Todas
          </button>
          {ESTADOS_ALTA.map(es => (
            <button
              key={es} type="button" onClick={() => setFiltro(es)} aria-pressed={filtro === es}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                filtro === es ? 'border-ink bg-ink text-ivory' : 'border-edge bg-surface text-ink-secondary hover:border-ink/40'
              }`}
            >
              {ETIQUETA_ESTADO[es]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-ink-muted">Cargando…</p>
        ) : altas.length === 0 ? (
          <p className="rounded-2xl border border-edge bg-surface px-5 py-8 text-center text-sm text-ink-muted">
            Todavía no hay altas{filtro ? ' con ese estado' : ''}.
          </p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {altas.map(a => (
              <li key={a.id}>
                <Link
                  href={`/admin/altas/${a.id}`}
                  className="block rounded-2xl border border-edge bg-surface px-5 py-4 transition-colors hover:border-gold/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{a.nombre}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-ink-secondary">{a.objetivo}</p>
                      <p className="mt-1.5 text-xs text-ink-muted">
                        {fecha(a.creadoEn)} · {a.dias} {a.dias === 1 ? 'día' : 'días'} de entrenamiento
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
                        CLASE_ESTADO[a.estado] ?? CLASE_ESTADO.descartado
                      }`}
                    >
                      {ETIQUETA_ESTADO[a.estado] ?? a.estado}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
