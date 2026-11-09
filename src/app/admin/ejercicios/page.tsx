'use client'

// /admin/ejercicios — Carga del video de cada ejercicio.
// El catálogo viene del código, en el mismo orden por estación que la guía de
// grabación. Acá solo se pega el link (YouTube no listado o archivo de video).

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { ESTACIONES, EJERCICIOS } from '@/lib/ejercicios/catalogo'
import { linkEjercicio } from '@/lib/ejercicios/video'

const inputClass = 'w-full px-3 py-2 rounded-lg border border-edge text-sm bg-surface focus:outline-none focus:border-primary'

export default function AdminEjerciciosPage() {
  const router = useRouter()
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [guardados, setGuardados] = useState<Record<string, string>>({})
  const [borrador, setBorrador] = useState<Record<string, string>>({})
  const [soloFaltantes, setSoloFaltantes] = useState(false)
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [copiado, setCopiado] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    fetch('/api/admin/ejercicios').then(async r => {
      if (r.status === 401 || r.status === 403) { router.push('/login'); return }
      const videos = (await r.json()).videos ?? {}
      setGuardados(videos)
      setBorrador(videos)
      setCargando(false)
    })
  }, [router])

  async function guardar(slug: string) {
    const valor = (borrador[slug] ?? '').trim()
    if (valor === (guardados[slug] ?? '')) return
    setErrores(e => ({ ...e, [slug]: '' }))

    const r = await fetch('/api/admin/ejercicios', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, videoUrl: valor }),
    })
    const data = await r.json()
    if (!r.ok) { setErrores(e => ({ ...e, [slug]: data.error ?? 'No se pudo guardar.' })); return }

    setGuardados(g => {
      const nuevo = { ...g }
      if (data.videoUrl) nuevo[slug] = data.videoUrl
      else delete nuevo[slug]
      return nuevo
    })
    setBorrador(b => ({ ...b, [slug]: data.videoUrl ?? '' }))
  }

  function copiar(slug: string) {
    navigator.clipboard.writeText(linkEjercicio(slug))
    setCopiado(slug)
    setTimeout(() => setCopiado(null), 2000)
  }

  const conVideo = EJERCICIOS.filter(e => guardados[e.slug]).length

  return (
    <div className="min-h-screen bg-background">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/admin" className="text-sm text-ink-muted hover:text-ink">← Volver al panel</Link>

        <div className="flex items-end justify-between gap-4 mt-3 mb-2">
          <h1 className="text-2xl font-bold text-ink">Biblioteca de ejercicios</h1>
          <p className="text-sm text-ink-muted whitespace-nowrap">
            <strong className="text-ink">{conVideo}</strong> de {EJERCICIOS.length} con video
          </p>
        </div>
        <div className="h-2 rounded-full bg-edge overflow-hidden mb-4">
          <div className="h-full bg-primary transition-all" style={{ width: `${(conVideo / EJERCICIOS.length) * 100}%` }} />
        </div>

        <p className="text-sm text-ink-muted mb-4 leading-relaxed">
          Subí cada video a YouTube como <strong>No listado</strong> y pegá el link acá. Se guarda al salir del campo.
          El orden es el mismo que el de la guía de grabación.
        </p>

        <label className="inline-flex items-center gap-2 text-sm text-ink mb-6 cursor-pointer">
          <input type="checkbox" checked={soloFaltantes} onChange={e => setSoloFaltantes(e.target.checked)} />
          Mostrar solo los que faltan
        </label>

        {cargando ? (
          <p className="text-sm text-ink-muted">Cargando…</p>
        ) : ESTACIONES.map(estacion => {
          const visibles = estacion.ejercicios.filter(e => !soloFaltantes || !guardados[e.slug])
          if (visibles.length === 0) return null
          const hechos = estacion.ejercicios.filter(e => guardados[e.slug]).length

          return (
            <section key={estacion.numero} className="mb-8">
              <div className="flex items-baseline justify-between gap-3 mb-3">
                <h2 className="font-semibold text-ink">
                  {estacion.numero}. {estacion.nombre}
                </h2>
                <span className="text-xs text-ink-muted">{hechos}/{estacion.ejercicios.length}</span>
              </div>

              <div className="bg-surface border border-edge rounded-2xl divide-y divide-edge">
                {visibles.map(e => (
                  <div key={e.slug} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-medium text-ink">
                          <span className="text-ink-muted font-mono text-xs mr-2">{e.codigo}</span>
                          {e.nombre}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5">{e.clave}</p>
                      </div>
                      {guardados[e.slug] && (
                        <div className="flex gap-3 text-xs whitespace-nowrap">
                          <a href={`/ejercicios/${e.slug}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver</a>
                          <button onClick={() => copiar(e.slug)} className="text-primary hover:underline cursor-pointer">
                            {copiado === e.slug ? 'Copiado' : 'Copiar link'}
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      type="url"
                      inputMode="url"
                      placeholder="https://youtu.be/…"
                      aria-label={`Link del video de ${e.nombre}`}
                      className={inputClass}
                      value={borrador[e.slug] ?? ''}
                      onChange={ev => setBorrador(b => ({ ...b, [e.slug]: ev.target.value }))}
                      onBlur={() => guardar(e.slug)}
                      onKeyDown={ev => { if (ev.key === 'Enter') ev.currentTarget.blur() }}
                    />
                    {errores[e.slug] && <p className="text-xs text-red-600 mt-1">{errores[e.slug]}</p>}
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}
