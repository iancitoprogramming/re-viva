'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { WHATSAPP_NUMBER } from '@/lib/constants'

interface Cliente {
  id: string
  nombre: string
  email: string
  creadoEn: string
  plan: {
    estado: 'PENDIENTE' | 'ACTIVO' | 'ARCHIVADO'
    activadoEn?: string | null
    fechaVencimiento?: string | null
    tipoPlan?: string | null
  } | null
  tienePerfil: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularEstadoPlan(plan: Cliente['plan']): 'ACTIVO' | 'PROXIMO' | 'VENCIDO' | 'PENDIENTE' | null {
  if (!plan) return null
  if (plan.estado !== 'ACTIVO') return 'PENDIENTE'
  if (!plan.fechaVencimiento) return 'ACTIVO'
  const dias = Math.ceil((new Date(plan.fechaVencimiento).getTime() - Date.now()) / 86400000)
  if (dias <= 0) return 'VENCIDO'
  if (dias <= 7) return 'PROXIMO'
  return 'ACTIVO'
}

// ─── Componentes ─────────────────────────────────────────────────────────────

function MetricaCard({ valor, label, color }: { valor: number; label: string; color: 'gold' | 'primary' | 'ink' }) {
  const estilos = {
    gold:    'bg-gold-light text-ink border-gold/40',
    primary: 'bg-primary/10 text-primary border-primary/20',
    ink:     'bg-surface-warm text-ink-secondary border-edge',
  }
  return (
    <div className={`flex-1 rounded-2xl border px-5 py-4 ${estilos[color]}`}>
      <p className="text-2xl font-bold">{valor}</p>
      <p className="text-xs font-medium mt-0.5 opacity-70">{label}</p>
    </div>
  )
}

function EstadoBadge({ plan }: { plan: Cliente['plan'] }) {
  const estado = calcularEstadoPlan(plan)
  if (!estado) return null
  const cfg = {
    ACTIVO:    { label: 'Activo',            clase: 'bg-primary/10 text-primary border-primary/20' },
    PROXIMO:   { label: 'Próximo a vencer',  clase: 'bg-amber-100 text-amber-800 border-amber-300' },
    VENCIDO:   { label: 'Vencido',           clase: 'bg-red-50 text-red-700 border-red-200' },
    PENDIENTE: { label: 'Pendiente',         clase: 'bg-gold-light text-ink border-gold/40' },
  }[estado]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.clase} whitespace-nowrap`}>
      {cfg.label}
    </span>
  )
}

function ClienteCard({ cliente }: { cliente: Cliente }) {
  const [copiado, setCopiado] = useState(false)

  function copiarEmail() {
    navigator.clipboard.writeText(cliente.email)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, te habla Ian de REVIVA.`)}`

  const fecha = cliente.plan?.activadoEn
    ? new Date(cliente.plan.activadoEn).toLocaleDateString('es-AR')
    : new Date(cliente.creadoEn).toLocaleDateString('es-AR')
  const fechaLabel = cliente.plan?.activadoEn ? 'Activado' : 'Registrado'

  const vencimientoLabel = cliente.plan?.fechaVencimiento
    ? `Vence: ${new Date(cliente.plan.fechaVencimiento).toLocaleDateString('es-AR')}`
    : null

  return (
    <div className="bg-surface border border-edge rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-ink text-sm">{cliente.nombre}</p>
          <EstadoBadge plan={cliente.plan} />
        </div>
        <p className="text-ink-muted text-xs mt-0.5 truncate">{cliente.email}</p>
        <p className="text-ink-muted text-xs mt-0.5">
          {fechaLabel}: {fecha}
          {vencimientoLabel && <span className="ml-2">· {vencimientoLabel}</span>}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-[#25D366] border border-[#25D366]/30 rounded-lg px-2.5 py-1.5 hover:bg-[#25D366]/10 transition-all"
        >
          WA
        </a>
        <button
          onClick={copiarEmail}
          className="text-xs font-medium text-ink-secondary border border-edge rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-all"
        >
          {copiado ? '✓ Copiado' : 'Email'}
        </button>
        {cliente.tienePerfil && (
          <Link
            href={`/admin/cliente/${cliente.id}`}
            className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-lg px-3 py-1.5 transition-all whitespace-nowrap"
          >
            Ver →
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Modal registrar cliente ──────────────────────────────────────────────────

function ModalRegistrar({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [nombre, setNombre]     = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [notas, setNotas]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const overlayRef              = useRef<HTMLDivElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/registrar-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password, notas }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al registrar.'); return }
      onSuccess()
    } catch {
      setError('Error de conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(26,36,22,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="bg-ivory w-full max-w-md rounded-3xl p-6 shadow-2xl border border-edge">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-serif text-xl text-ink">Registrar cliente</h2>
            <p className="text-ink-muted text-xs mt-0.5">El cliente recibe sus credenciales por email</p>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink transition-colors text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1 block">Nombre</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo"
              className="w-full bg-surface border border-edge rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1 block">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ejemplo.com"
              className="w-full bg-surface border border-edge rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1 block">Contraseña temporal</label>
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres"
              className="w-full bg-surface border border-edge rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors" required />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1 block">Notas <span className="normal-case font-normal text-ink-muted">(opcional)</span></label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Ej: Plan trimestral ya pago · Promo 2x1 - $75.000/mes" rows={2}
              className="w-full bg-surface border border-edge rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors resize-none" />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-edge text-ink-secondary font-medium py-2.5 rounded-xl text-sm hover:border-primary hover:text-primary transition-all">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-dark text-ivory font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60">
              {loading ? 'Registrando...' : 'Registrar y enviar acceso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter()
  const [clientes, setClientes]       = useState<Cliente[]>([])
  const [loading, setLoading]         = useState(true)
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [modalOpen, setModalOpen]     = useState(false)

  // Search + pagination
  const [busqueda, setBusqueda]   = useState('')
  const [busquedaInput, setBusquedaInput] = useState('')
  const [page, setPage]           = useState(1)
  const [limit, setLimit]         = useState(20)
  const [total, setTotal]         = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  // Alertas: consentimientos legales pendientes de revisión personal
  const [consentimientosPendientes, setConsentimientosPendientes] = useState(0)
  // Alerta: ebooks/cursos comprados pendientes de envío manual por WhatsApp
  const [ebooksPendientes, setEbooksPendientes] = useState(0)

  const cargarClientes = useCallback(async (q: string, p: number, l: number) => {
    setLoading(true)
    const params = new URLSearchParams({
      busqueda: q,
      page:     String(p),
      limit:    String(l),
    })
    const res  = await fetch(`/api/admin/clientes?${params}`)
    if (!res.ok) { router.push('/dashboard'); return }
    const data = await res.json()
    setClientes(data.clientes)
    setTotal(data.total)
    setTotalPages(data.totalPages)
    setLoading(false)
  }, [router])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(d.nombre)
    })
    cargarClientes('', 1, 20)
    fetch('/api/admin/consentimientos-pendientes')
      .then(r => r.json())
      .then(d => setConsentimientosPendientes(d.total ?? 0))
      .catch(() => {})
    fetch('/api/admin/ebooks-pendientes')
      .then(r => r.json())
      .then(d => setEbooksPendientes(d.totalPendientes ?? 0))
      .catch(() => {})
  }, [router, cargarClientes])

  // Buscar con delay
  useEffect(() => {
    const t = setTimeout(() => {
      setBusqueda(busquedaInput)
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [busquedaInput])

  useEffect(() => {
    if (!loading || page > 1 || busqueda !== '') {
      cargarClientes(busqueda, page, limit)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, page, limit])

  const pendientes = clientes.filter(c => !c.plan || c.plan.estado === 'PENDIENTE')
  const activos    = clientes.filter(c => c.plan?.estado === 'ACTIVO')
  const sinPerfil  = clientes.filter(c => !c.tienePerfil)
  const proximos   = clientes.filter(c => calcularEstadoPlan(c.plan) === 'PROXIMO')
  const vencidos   = clientes.filter(c => calcularEstadoPlan(c.plan) === 'VENCIDO')

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      {modalOpen && (
        <ModalRegistrar
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false)
            cargarClientes(busqueda, page, limit)
          }}
        />
      )}

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-serif text-2xl text-ink">Panel REVIVA</h1>
            <p className="text-ink-muted text-sm mt-0.5">
              {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-ivory text-xs font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap mt-1"
          >
            + Registrar cliente
          </button>
        </div>

        {/* Métricas */}
        <div className="flex gap-3 mb-6">
          <MetricaCard valor={pendientes.length} label="Pendientes" color="gold" />
          <MetricaCard valor={activos.length}    label="Activos"    color="primary" />
          <MetricaCard valor={total}             label="Total"      color="ink" />
        </div>

        {/* Accesos rápidos — motor de planes */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/admin/revisiones"
            className="bg-surface border border-edge rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3 col-span-2">
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-semibold text-ink text-sm">Cola de revisiones</p>
              <p className="text-xs text-ink-muted">Planes generados por IA pendientes de aprobación</p>
            </div>
          </Link>
          <Link href="/admin/templates"
            className="bg-surface border border-edge rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold text-ink text-sm">Templates</p>
              <p className="text-xs text-ink-muted">Planes base + IA</p>
            </div>
          </Link>
          <Link href="/admin/foods"
            className="bg-surface border border-edge rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <span className="text-2xl">🥦</span>
            <div>
              <p className="font-semibold text-ink text-sm">Alimentos</p>
              <p className="text-xs text-ink-muted">Catálogo de macros</p>
            </div>
          </Link>
        </div>

        {/* Alertas */}
        {ebooksPendientes > 0 && (
          <Link href="/admin/ebooks-pendientes"
            className="bg-emerald-50 border border-emerald-300 rounded-2xl px-4 py-3 mb-5 flex items-center gap-2 text-sm text-emerald-800 hover:bg-emerald-100 transition-colors">
            <span>📚</span>
            <span className="flex-1">
              <strong>{ebooksPendientes}</strong> ebook{ebooksPendientes !== 1 ? 's' : ''}/curso{ebooksPendientes !== 1 ? 's' : ''} pago{ebooksPendientes !== 1 ? 's' : ''} pendiente{ebooksPendientes !== 1 ? 's' : ''} de envío
              <span className="text-emerald-700 ml-2">→</span>
            </span>
          </Link>
        )}
        {consentimientosPendientes > 0 && (
          <Link href="/admin/consentimientos-pendientes"
            className="bg-blue-50 border border-blue-300 rounded-2xl px-4 py-3 mb-5 flex items-center gap-2 text-sm text-blue-800 hover:bg-blue-100 transition-colors">
            <span>📞</span>
            <span className="flex-1">
              <strong>{consentimientosPendientes}</strong> cliente{consentimientosPendientes !== 1 ? 's' : ''} pendiente{consentimientosPendientes !== 1 ? 's' : ''} de charla legal
              <span className="text-blue-600 ml-2">→</span>
            </span>
          </Link>
        )}
        {proximos.length > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl px-4 py-3 mb-5 flex items-center gap-2 text-sm text-amber-800">
            <span>⚠️</span>
            <span><strong>{proximos.length}</strong> plan{proximos.length !== 1 ? 'es' : ''} próximo{proximos.length !== 1 ? 's' : ''} a vencer esta semana</span>
          </div>
        )}
        {vencidos.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5 flex items-center gap-2 text-sm text-red-700">
            <span>🔴</span>
            <span><strong>{vencidos.length}</strong> plan{vencidos.length !== 1 ? 'es' : ''} vencido{vencidos.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Buscador + limit */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={busquedaInput}
              onChange={e => setBusquedaInput(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="w-full bg-surface border border-edge rounded-xl pl-9 pr-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <select
            value={limit}
            onChange={e => { setLimit(Number(e.target.value)); setPage(1) }}
            className="bg-surface border border-edge rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-primary transition-colors"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-7 h-7 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* ── Pendientes ── */}
            {pendientes.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-bold text-ink-secondary uppercase tracking-widest mb-3">Pendientes de activación</h2>
                <div className="flex flex-col gap-3">
                  {pendientes.map(c => <ClienteCard key={c.id} cliente={c} />)}
                </div>
              </section>
            )}

            {/* ── Activos ── */}
            {activos.length > 0 && (
              <section className="mb-8">
                <h2 className="text-xs font-bold text-ink-secondary uppercase tracking-widest mb-3">Clientes activos</h2>
                <div className="flex flex-col gap-3">
                  {activos.map(c => <ClienteCard key={c.id} cliente={c} />)}
                </div>
              </section>
            )}

            {/* ── Sin perfil ── */}
            {sinPerfil.length > 0 && !busqueda && (
              <section className="mb-8">
                <h2 className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">Sin perfil</h2>
                <div className="bg-surface border border-edge rounded-2xl divide-y divide-edge overflow-hidden">
                  {sinPerfil.map(c => (
                    <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{c.nombre}</p>
                        <p className="text-xs text-ink-muted truncate">{c.email}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-warm text-ink-muted border border-edge flex-shrink-0">Sin perfil</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {clientes.length === 0 && (
              <div className="bg-surface border border-edge rounded-2xl p-12 text-center text-ink-muted">
                {busqueda ? `Sin resultados para "${busqueda}"` : 'Aún no hay clientes registrados.'}
              </div>
            )}

            {/* ── Paginación ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-edge">
                <p className="text-xs text-ink-muted">
                  {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} de {total}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-edge text-ink-secondary hover:border-primary hover:text-primary disabled:opacity-40 transition-all"
                  >
                    ← Anterior
                  </button>
                  <span className="px-3 py-1.5 text-sm font-medium text-ink">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm border border-edge text-ink-secondary hover:border-primary hover:text-primary disabled:opacity-40 transition-all"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
