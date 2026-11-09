'use client'

// /admin/cliente/[id]/compras — Listas de compras semanales (interno).
// Se pega la lista de cada semana tal como figura en el Documento de Nutrición
// (categoría en una línea, debajo "producto cantidad unidad") y se envía por mail.

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { agruparPorCategoria, cantidadLegible, listaATexto, parsearListaTexto, type ItemCompra } from '@/lib/compras'
import { etiqueta, SUPERMERCADOS, SESIONES_COCINA } from '@/lib/cuestionario'

interface Lista {
  id: string
  semana: number
  notas: string | null
  enviadoEn: string | null
  items: ItemCompra[]
}
interface Cliente {
  nombre: string
  email: string
  perfil: { supermercado: string | null; comeAfuera: string; sesionesCocina: string | null } | null
  shoppingLists: Lista[]
}

const EJEMPLO = `PROTEÍNAS
Pechuga de pollo 1400 g
Huevos 12 unidad
CARBOHIDRATOS
Arroz 700 g
VERDURAS
Brócoli 2 unidad
ALMACÉN
Aceite de oliva 250 ml`

export default function ComprasClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [semana, setSemana] = useState(1)
  const [texto, setTexto] = useState('')
  const [notas, setNotas] = useState('')
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function cargar(semanaElegida?: number) {
    const r = await fetch(`/api/admin/compras/${id}`)
    if (r.status === 401 || r.status === 403) { router.push('/login'); return }
    const d: Cliente = await r.json()
    setCliente(d)
    const s = semanaElegida ?? d.shoppingLists[0]?.semana ?? 1
    elegirSemana(s, d)
  }

  function elegirSemana(s: number, c: Cliente | null = cliente) {
    setSemana(s)
    setMensaje(null)
    const lista = c?.shoppingLists.find(l => l.semana === s)
    setTexto(lista ? listaATexto(lista.items) : '')
    setNotas(lista?.notas ?? '')
  }

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const vistaPrevia = useMemo(() => parsearListaTexto(texto), [texto])
  const listaActual = cliente?.shoppingLists.find(l => l.semana === semana) ?? null
  const semanas = cliente?.shoppingLists.map(l => l.semana) ?? []
  const proximaSemana = Math.max(0, ...semanas) + 1

  function copiarSemanaAnterior() {
    const anterior = cliente?.shoppingLists.filter(l => l.semana < semana).at(-1)
    if (anterior) setTexto(listaATexto(anterior.items))
  }

  async function guardar() {
    setGuardando(true)
    setMensaje(null)
    const r = await fetch(`/api/admin/compras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semana, texto, notas }),
    })
    const d = await r.json()
    setGuardando(false)
    if (!r.ok) {
      setMensaje({ tipo: 'error', texto: d.errores?.length ? `${d.error} ${d.errores.join(' · ')}` : d.error })
      return
    }
    setMensaje({ tipo: 'ok', texto: `Semana ${semana} guardada (${d.items} productos).` })
    cargar(semana)
  }

  async function enviar(semanasAEnviar: number[]) {
    if (!cliente) return
    if (!confirm(`¿Enviar ${semanasAEnviar.length > 1 ? `las semanas ${semanasAEnviar.join(', ')}` : `la semana ${semanasAEnviar[0]}`} a ${cliente.email}?`)) return
    setEnviando(true)
    const r = await fetch(`/api/admin/compras/${id}/enviar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semanas: semanasAEnviar }),
    })
    const d = await r.json()
    setEnviando(false)
    setMensaje(r.ok
      ? { tipo: 'ok', texto: `Enviado: semana${d.enviadas.length > 1 ? 's' : ''} ${d.enviadas.join(', ')}.` }
      : { tipo: 'error', texto: d.error })
    cargar(semana)
  }

  async function borrarSemana() {
    if (!listaActual || !confirm(`¿Borrar la lista de la semana ${semana}?`)) return
    await fetch(`/api/admin/compras/${id}?semana=${semana}`, { method: 'DELETE' })
    cargar()
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href={`/admin/cliente/${id}`} className="text-sm text-primary hover:underline">← Volver al cliente</Link>

        <h1 className="font-serif text-2xl text-ink mt-4">Listas de compras</h1>
        {cliente && (
          <p className="text-sm text-ink-muted mt-0.5">
            {cliente.nombre} · {cliente.email}
            {cliente.perfil && <> · Súper: {etiqueta(SUPERMERCADOS, cliente.perfil.supermercado)} · Cocina: {etiqueta(SESIONES_COCINA, cliente.perfil.sesionesCocina)}</>}
          </p>
        )}

        {/* Semanas */}
        <div className="flex flex-wrap gap-2 mt-6">
          {semanas.map(s => {
            const l = cliente?.shoppingLists.find(x => x.semana === s)
            return (
              <button key={s} onClick={() => elegirSemana(s)}
                className={`px-3 py-1.5 rounded-xl text-sm border ${s === semana ? 'bg-primary text-ivory border-primary' : 'bg-surface border-edge text-ink-secondary'}`}>
                Semana {s}{l?.enviadoEn ? ' ✓' : ''}
              </button>
            )
          })}
          {!semanas.includes(semana) && (
            <span className="px-3 py-1.5 rounded-xl text-sm border border-dashed border-primary text-primary">Semana {semana} (nueva)</span>
          )}
          <button onClick={() => elegirSemana(proximaSemana)} className="px-3 py-1.5 rounded-xl text-sm text-primary font-semibold">
            + Semana {proximaSemana}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {/* Editor */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-ink-secondary">Lista de la semana {semana}</label>
              {semana > 1 && <button onClick={copiarSemanaAnterior} className="text-xs text-primary">Copiar semana anterior</button>}
            </div>
            <textarea value={texto} onChange={e => setTexto(e.target.value)} placeholder={EJEMPLO} rows={18}
              className="w-full px-3 py-2 rounded-xl border border-edge text-sm font-mono bg-surface focus:outline-none focus:border-primary" />
            <input value={notas} onChange={e => setNotas(e.target.value)} placeholder="Nota para el cliente (opcional)"
              className="w-full px-3 py-2 rounded-xl border border-edge text-sm bg-surface focus:outline-none focus:border-primary" />
            <p className="text-xs text-ink-muted">
              Categorías: Proteínas, Carbohidratos, Verduras, Frutas, Lácteos, Almacén, Suplementos. Unidades: g, kg, ml, l, unidad, paquete, lata, docena.
            </p>
          </div>

          {/* Vista previa (como la ve el cliente) */}
          <div className="bg-surface border border-edge rounded-2xl p-4">
            <p className="text-xs font-semibold text-ink-secondary mb-2">Vista previa del mail</p>
            {vistaPrevia.errores.length > 0 && (
              <div className="bg-red-50 text-red-700 text-xs rounded-lg p-2 mb-2">
                No entiendo estas líneas: {vistaPrevia.errores.join(' · ')}
              </div>
            )}
            {agruparPorCategoria(vistaPrevia.items).map(g => (
              <div key={g.key} className="mb-3">
                <p className="text-[11px] uppercase tracking-wider text-primary font-semibold">{g.label}</p>
                {g.items.map((i, n) => (
                  <div key={n} className="flex justify-between text-sm py-0.5 border-b border-edge last:border-0">
                    <span className="text-ink">{i.nombre}</span>
                    <span className="font-semibold text-ink">{cantidadLegible(i.cantidad, i.unidad)}</span>
                  </div>
                ))}
              </div>
            ))}
            {vistaPrevia.items.length === 0 && vistaPrevia.errores.length === 0 && (
              <p className="text-sm text-ink-muted">Pegá la lista a la izquierda.</p>
            )}
          </div>
        </div>

        {mensaje && (
          <p className={`mt-4 text-sm rounded-xl px-4 py-2 ${mensaje.tipo === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>
            {mensaje.texto}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={guardar} disabled={guardando || !texto.trim()}
            className="bg-primary text-ivory text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50">
            {guardando ? 'Guardando…' : 'Guardar semana'}
          </button>
          {listaActual && (
            <button onClick={() => enviar([semana])} disabled={enviando}
              className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50">
              {enviando ? 'Enviando…' : `Enviar semana ${semana} por mail`}
            </button>
          )}
          {semanas.length > 1 && (
            <button onClick={() => enviar(semanas)} disabled={enviando}
              className="border border-emerald-600 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50">
              Enviar todas ({semanas.length})
            </button>
          )}
          {listaActual && (
            <button onClick={borrarSemana} className="text-sm text-red-600 ml-auto">Borrar semana</button>
          )}
        </div>
        {listaActual?.enviadoEn && (
          <p className="text-xs text-ink-muted mt-2">Último envío: {new Date(listaActual.enviadoEn).toLocaleString('es-AR')}</p>
        )}
      </main>
    </div>
  )
}
