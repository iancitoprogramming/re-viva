'use client'

// /admin/suplementos — Catálogo de suplementos recomendados.
// Flujo: Ian devuelve el link de afiliado con el nombre del producto → se pega
// acá (marca + link + precio) → "Activar". Recién ahí aparece en /suplementos.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { OBJETIVOS_SUPLEMENTO, linkAfiliadoTrackeado } from '@/lib/suplementos'

interface Suplemento {
  id: string
  slug: string
  nombre: string
  marca: string | null
  objetivos: string[]
  paraQueSirve: string
  aQuienSeRecomienda: string
  comoSeUsa: string
  linkAfiliado: string | null
  precioArs: number | null
  relevadoEn: string | null
  prioridad: number
  activo: boolean
  clicks30d: number
}

const VACIO = {
  slug: '', nombre: '', marca: '', objetivos: [] as string[], paraQueSirve: '',
  aQuienSeRecomienda: '', comoSeUsa: '', linkAfiliado: '', precioArs: '', prioridad: '0',
}

const inputClass = 'w-full px-3 py-2 rounded-lg border border-edge text-sm bg-surface focus:outline-none focus:border-primary'

export default function AdminSuplementosPage() {
  const router = useRouter()
  const [items, setItems] = useState<Suplemento[]>([])
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [borrador, setBorrador] = useState<typeof VACIO>(VACIO)
  const [creando, setCreando] = useState(false)
  const [error, setError] = useState('')
  const [copiado, setCopiado] = useState<string | null>(null)

  async function cargar() {
    const r = await fetch('/api/admin/suplementos')
    if (r.status === 401 || r.status === 403) { router.push('/login'); return }
    setItems((await r.json()).items ?? [])
  }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function abrirEdicion(s: Suplemento) {
    setCreando(false)
    setEditando(s.id)
    setError('')
    setBorrador({
      slug: s.slug, nombre: s.nombre, marca: s.marca ?? '', objetivos: s.objetivos,
      paraQueSirve: s.paraQueSirve, aQuienSeRecomienda: s.aQuienSeRecomienda, comoSeUsa: s.comoSeUsa,
      linkAfiliado: s.linkAfiliado ?? '', precioArs: s.precioArs?.toString() ?? '', prioridad: String(s.prioridad),
    })
  }

  async function guardar() {
    setError('')
    const r = await fetch(creando ? '/api/admin/suplementos' : `/api/admin/suplementos/${editando}`, {
      method: creando ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(borrador),
    })
    const d = await r.json()
    if (!r.ok) { setError(d.error ?? 'No se pudo guardar.'); return }
    setEditando(null); setCreando(false); setBorrador(VACIO)
    cargar()
  }

  async function toggleActivo(s: Suplemento) {
    const r = await fetch(`/api/admin/suplementos/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !s.activo }),
    })
    const d = await r.json()
    if (!r.ok) { alert(d.error ?? 'No se pudo cambiar.'); return }
    cargar()
  }

  async function borrar(s: Suplemento) {
    if (!confirm(`¿Borrar "${s.nombre}" y sus clics?`)) return
    await fetch(`/api/admin/suplementos/${s.id}`, { method: 'DELETE' })
    cargar()
  }

  function copiarLinkDocumento(slug: string) {
    navigator.clipboard.writeText(linkAfiliadoTrackeado(slug, 'documento'))
    setCopiado(slug)
    setTimeout(() => setCopiado(null), 2000)
  }

  const formulario = (
    <div className="bg-surface-warm border border-edge rounded-2xl p-4 flex flex-col gap-3 mt-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Campo label="Nombre"><input className={inputClass} value={borrador.nombre} onChange={e => setBorrador(b => ({ ...b, nombre: e.target.value }))} /></Campo>
        <Campo label="Slug (URL)"><input className={inputClass} value={borrador.slug} placeholder="creatina-monohidrato" onChange={e => setBorrador(b => ({ ...b, slug: e.target.value }))} /></Campo>
        <Campo label="Marca / producto exacto"><input className={inputClass} value={borrador.marca} onChange={e => setBorrador(b => ({ ...b, marca: e.target.value }))} /></Campo>
        <Campo label="Precio aprox. (ARS)"><input className={inputClass} type="number" value={borrador.precioArs} onChange={e => setBorrador(b => ({ ...b, precioArs: e.target.value }))} /></Campo>
      </div>
      <Campo label="Link de afiliado (el que devuelve Ian)">
        <input className={inputClass} value={borrador.linkAfiliado} placeholder="https://..." onChange={e => setBorrador(b => ({ ...b, linkAfiliado: e.target.value }))} />
      </Campo>
      <Campo label="Objetivos (solapas)">
        <div className="flex flex-wrap gap-2">
          {OBJETIVOS_SUPLEMENTO.map(o => {
            const on = borrador.objetivos.includes(o.value)
            return (
              <button key={o.value} type="button"
                onClick={() => setBorrador(b => ({ ...b, objetivos: on ? b.objetivos.filter(x => x !== o.value) : [...b.objetivos, o.value] }))}
                className={`px-3 py-1 rounded-lg text-xs border ${on ? 'bg-primary text-ivory border-primary' : 'border-edge text-ink-secondary'}`}>
                {o.label}
              </button>
            )
          })}
        </div>
      </Campo>
      <Campo label="Para qué sirve"><textarea className={inputClass} rows={2} value={borrador.paraQueSirve} onChange={e => setBorrador(b => ({ ...b, paraQueSirve: e.target.value }))} /></Campo>
      <Campo label="A quién se recomienda"><textarea className={inputClass} rows={2} value={borrador.aQuienSeRecomienda} onChange={e => setBorrador(b => ({ ...b, aQuienSeRecomienda: e.target.value }))} /></Campo>
      <Campo label="Cómo se usa (según la etiqueta de ESTA marca)"><textarea className={inputClass} rows={2} value={borrador.comoSeUsa} onChange={e => setBorrador(b => ({ ...b, comoSeUsa: e.target.value }))} /></Campo>
      <Campo label="Prioridad (mayor = más arriba)"><input className={inputClass} type="number" value={borrador.prioridad} onChange={e => setBorrador(b => ({ ...b, prioridad: e.target.value }))} /></Campo>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button onClick={guardar} className="bg-primary text-ivory text-sm font-semibold px-4 py-2 rounded-xl">Guardar</button>
        <button onClick={() => { setEditando(null); setCreando(false); setError('') }} className="text-sm text-ink-muted px-3">Cancelar</button>
      </div>
    </div>
  )

  const sinLink = items.filter(s => !s.linkAfiliado).length

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-2 gap-3">
          <div>
            <h1 className="font-serif text-2xl text-ink">Catálogo de suplementos</h1>
            <p className="text-ink-muted text-sm mt-0.5">
              Solo se publica lo que está activo y tiene link de afiliado. <Link href="/suplementos" target="_blank" className="text-primary underline">Ver catálogo</Link>
            </p>
          </div>
          <Link href="/admin" className="text-sm text-ink-muted hover:text-primary">← Panel</Link>
        </div>

        {sinLink > 0 && (
          <p className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl px-4 py-2 text-sm mb-4">
            {sinLink} producto{sinLink > 1 ? 's' : ''} sin link de afiliado. Pedíselos a Ian con el nombre exacto.
          </p>
        )}

        <button
          onClick={() => { setCreando(true); setEditando(null); setBorrador(VACIO); setError('') }}
          className="mb-4 text-sm font-semibold text-primary">
          + Nuevo producto
        </button>
        {creando && formulario}

        <div className="flex flex-col gap-3 mt-3">
          {items.map(s => (
            <div key={s.id} className="bg-surface border border-edge rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{s.nombre}{s.marca && <span className="text-ink-muted font-normal"> · {s.marca}</span>}</p>
                  <p className="text-xs text-ink-muted mt-0.5 break-all">
                    /{s.slug} · {s.objetivos.map(o => OBJETIVOS_SUPLEMENTO.find(x => x.value === o)?.label ?? o).join(', ')}
                    {' · '}{s.clicks30d} clics (30 días)
                    {s.relevadoEn && ` · relevado ${new Date(s.relevadoEn).toLocaleDateString('es-AR')}`}
                  </p>
                  {!s.linkAfiliado && <p className="text-xs text-amber-700 mt-1">Sin link de afiliado</p>}
                </div>
                <button onClick={() => toggleActivo(s)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${s.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                  {s.activo ? 'Publicado' : 'Oculto'}
                </button>
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs">
                <button onClick={() => abrirEdicion(s)} className="text-primary font-semibold">Editar</button>
                {s.linkAfiliado && (
                  <button onClick={() => copiarLinkDocumento(s.slug)} className="text-primary">
                    {copiado === s.slug ? '¡Copiado!' : 'Copiar link para el documento'}
                  </button>
                )}
                <button onClick={() => borrar(s)} className="text-red-600 ml-auto">Borrar</button>
              </div>
              {editando === s.id && formulario}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-ink-secondary">{label}</span>
      {children}
    </label>
  )
}
