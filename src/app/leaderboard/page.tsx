'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type Periodo = 'semanal' | 'mensual' | 'historico'

interface Entry {
  posicion: number
  userId: string
  nombre: string
  totalCheckins: number
  rachaActual: number
  consistenciaSemanal: number
  puntaje: number
  esTuyo: boolean
}

interface LeaderboardData {
  leaderboard: Entry[]
  miPosicion: Entry | null
  periodo: Periodo
}

const medallaEmoji = (pos: number) => {
  if (pos === 1) return '🥇'
  if (pos === 2) return '🥈'
  if (pos === 3) return '🥉'
  return null
}

export default function LeaderboardPage() {
  const router  = useRouter()
  const [nombre, setNombre]  = useState('')
  const [esAdmin, setEsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [data, setData]       = useState<LeaderboardData | null>(null)
  const [periodo, setPeriodo] = useState<Periodo>('semanal')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => { if (!r.ok) { router.push('/login'); return null } return r.json() })
      .then(d => { if (d) { setNombre(d.nombre); setEsAdmin(d.esAdmin) } })
  }, [router])

  const cargar = useCallback(async (p: Periodo) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/leaderboard?periodo=${p}`)
      const json = await res.json()
      if (res.ok) setData(json)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar(periodo) }, [periodo, cargar])

  const periodos: { key: Periodo; label: string }[] = [
    { key: 'semanal',   label: 'Esta semana' },
    { key: 'mensual',   label: 'Este mes' },
    { key: 'historico', label: 'Histórico' },
  ]

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombre} esAdmin={esAdmin} />

      <main className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="w-9 h-9 rounded-xl bg-surface border border-edge flex items-center justify-center hover:bg-surface-warm transition-colors">
            <svg className="w-4 h-4 text-ink-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="font-serif text-2xl text-ink">Ranking REVIVA</h1>
            <p className="text-ink-muted text-xs mt-0.5">Actividad confirmada. Anti-trampa por diseño.</p>
          </div>
        </div>

        {/* Tabs de periodo */}
        <div className="flex gap-2 mb-6 p-1 bg-surface rounded-2xl border border-edge">
          {periodos.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriodo(p.key)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                periodo === p.key
                  ? 'bg-primary text-ivory shadow-sm'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Mi posición (destacada) */}
        {data?.miPosicion && (
          <div className="bg-primary/8 border border-primary/20 rounded-2xl p-4 mb-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary flex-shrink-0">
              #{data.miPosicion.posicion}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink text-sm">Vos — {data.miPosicion.nombre}</p>
              <p className="text-ink-muted text-xs">
                {data.miPosicion.totalCheckins} check-ins · {data.miPosicion.rachaActual}🔥 racha
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-primary text-lg">{data.miPosicion.puntaje}</p>
              <p className="text-ink-muted text-xs">pts</p>
            </div>
          </div>
        )}

        {/* Tabla */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : !data?.leaderboard.length ? (
          <div className="bg-surface rounded-2xl border border-edge p-10 text-center">
            <p className="text-4xl mb-3">🏃</p>
            <p className="text-ink font-semibold mb-1">Nadie está rankeado aún</p>
            <p className="text-ink-muted text-sm">¡Hacé tu primer check-in y aparecé primero!</p>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-edge shadow-sm overflow-hidden">
            {data.leaderboard.map((entry, idx) => {
              const medalla = medallaEmoji(entry.posicion)
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                    entry.esTuyo ? 'bg-primary/5' : ''
                  } ${idx < data.leaderboard.length - 1 ? 'border-b border-edge' : ''}`}
                >
                  {/* Posición */}
                  <div className="w-9 flex-shrink-0 text-center">
                    {medalla ? (
                      <span className="text-xl">{medalla}</span>
                    ) : (
                      <span className="text-ink-muted font-mono text-sm font-semibold">
                        {entry.posicion}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${entry.esTuyo ? 'text-primary' : 'text-ink'}`}>
                      {entry.nombre} {entry.esTuyo && '(vos)'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-ink-muted">
                        {entry.totalCheckins} check-in{entry.totalCheckins !== 1 ? 's' : ''}
                      </span>
                      {entry.rachaActual > 0 && (
                        <span className="text-xs text-ink-muted">
                          · {entry.rachaActual}🔥
                        </span>
                      )}
                      {entry.consistenciaSemanal >= 5 && (
                        <span className="text-xs bg-gold-light text-ink px-1.5 py-0.5 rounded-full border border-gold/40">
                          constante
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Puntaje */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-ink">{entry.puntaje}</p>
                    <p className="text-ink-muted text-xs">pts</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Cómo funciona */}
        <div className="mt-6 bg-surface rounded-2xl border border-edge p-5">
          <h3 className="text-xs font-bold text-ink-secondary uppercase tracking-widest mb-3">Cómo se calcula</h3>
          <ul className="flex flex-col gap-1.5 text-xs text-ink-secondary">
            <li>📌 1 punto por cada check-in confirmado</li>
            <li>🔥 Bonus de 2 pts con racha ≥ 7 días (3 pts si ≥ 14)</li>
            <li>⚡ Bonus de 2 pts si sos activo 5+ días esta semana</li>
            <li>🔒 Máximo 1 check-in por categoría por día</li>
          </ul>
        </div>

      </main>
    </div>
  )
}
