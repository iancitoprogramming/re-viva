'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import { WHATSAPP_NUMBER } from '@/lib/constants'

interface Cliente {
  id: string
  nombre: string
  email: string
  creadoEn: string
  plan: { estado: 'PENDIENTE' | 'ACTIVO' | 'ARCHIVADO'; activadoEn?: string | null } | null
  tienePerfil: boolean
}

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

function ClienteCard({ cliente, tipo }: { cliente: Cliente; tipo: 'pendiente' | 'activo' | 'sin-perfil' }) {
  const [copiado, setCopiado] = useState(false)

  function copiarEmail() {
    navigator.clipboard.writeText(cliente.email)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola, te habla Ian de REVIVA. Quería consultar sobre tu plan.`)}`

  const fecha = tipo === 'activo' && cliente.plan?.activadoEn
    ? new Date(cliente.plan.activadoEn).toLocaleDateString('es-AR')
    : new Date(cliente.creadoEn).toLocaleDateString('es-AR')

  const fechaLabel = tipo === 'activo' ? 'Activado' : 'Registrado'

  return (
    <div className="bg-surface border border-edge rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-ink text-sm">{cliente.nombre}</p>
          {tipo === 'pendiente' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gold-light text-ink border border-gold/40 font-medium">
              Pendiente
            </span>
          )}
          {tipo === 'activo' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
              Activo
            </span>
          )}
        </div>
        <p className="text-ink-muted text-xs mt-0.5 truncate">{cliente.email}</p>
        <p className="text-ink-muted text-xs mt-0.5">{fechaLabel}: {fecha}</p>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={copiarEmail}
          className="text-xs font-medium text-ink-secondary border border-edge rounded-lg px-3 py-1.5 hover:border-primary hover:text-primary transition-all"
        >
          {copiado ? '✓ Email copiado' : 'Copiar email'}
        </button>

        {cliente.tienePerfil && (
          <Link
            href={`/admin/cliente/${cliente.id}`}
            className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 rounded-lg px-3 py-1.5 transition-all whitespace-nowrap"
          >
            Ver cliente →
          </Link>
        )}
      </div>
    </div>
  )
}

// ─── Modal: Registrar cliente manualmente ────────────────────────────────────
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
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nombre, email, password, notas }),
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
            <input
              value={nombre} onChange={e => setNombre(e.target.value)}
              placeholder="Nombre completo"
              className="w-full bg-surface border border-edge rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1 block">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="w-full bg-surface border border-edge rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1 block">Contraseña temporal</label>
            <input
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-surface border border-edge rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors"
              required
            />
            <p className="text-xs text-ink-muted mt-1">Se envía al cliente con el email de bienvenida.</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-1 block">Notas del plan <span className="normal-case font-normal text-ink-muted">(opcional)</span></label>
            <textarea
              value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Ej: Plan trimestral ya pago · Promo 2x1 - $75.000/mes - 2 veces por semana"
              rows={2}
              className="w-full bg-surface border border-edge rounded-xl px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-2 mt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 border border-edge text-ink-secondary font-medium py-2.5 rounded-xl text-sm hover:border-primary hover:text-primary transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-dark text-ivory font-semibold py-2.5 rounded-xl text-sm transition-all disabled:opacity-60"
            >
              {loading ? 'Registrando...' : 'Registrar y enviar acceso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [clientes, setClientes]       = useState<Cliente[]>([])
  const [loading, setLoading]         = useState(true)
  const [nombreAdmin, setNombreAdmin] = useState('')
  const [modalOpen, setModalOpen]     = useState(false)

  function cargarClientes() {
    fetch('/api/admin/clientes')
      .then(res => { if (!res.ok) { router.push('/dashboard'); return null } return res.json() })
      .then(data => { if (data) { setClientes(data); setLoading(false) } })
  }

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (!data.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(data.nombre)
    })
    cargarClientes()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  const pendientes = clientes.filter(c => c.plan?.estado === 'PENDIENTE' || (!c.plan && c.tienePerfil))
  const activos    = clientes.filter(c => c.plan?.estado === 'ACTIVO')
  const sinPerfil  = clientes.filter(c => !c.tienePerfil)

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      {modalOpen && (
        <ModalRegistrar
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false)
            setLoading(true)
            cargarClientes()
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
        <div className="flex gap-3 mb-8">
          <MetricaCard valor={pendientes.length} label="Pendientes" color="gold" />
          <MetricaCard valor={activos.length}    label="Activos"    color="primary" />
          <MetricaCard valor={clientes.length}   label="Total"      color="ink" />
        </div>

        {/* ── Pendientes de activación ── */}
        {pendientes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold text-ink-secondary uppercase tracking-widest mb-3">
              Pendientes de activación
            </h2>
            <div className="flex flex-col gap-3">
              {pendientes.map(c => (
                <ClienteCard key={c.id} cliente={c} tipo="pendiente" />
              ))}
            </div>
          </section>
        )}

        {/* ── Clientes activos ── */}
        {activos.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold text-ink-secondary uppercase tracking-widest mb-3">
              Clientes activos
            </h2>
            <div className="flex flex-col gap-3">
              {activos.map(c => (
                <ClienteCard key={c.id} cliente={c} tipo="activo" />
              ))}
            </div>
          </section>
        )}

        {/* ── Sin perfil (registros incompletos) ── */}
        {sinPerfil.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-bold text-ink-muted uppercase tracking-widest mb-3">
              Registros sin perfil
            </h2>
            <div className="bg-surface border border-edge rounded-2xl divide-y divide-edge overflow-hidden">
              {sinPerfil.map(c => (
                <div key={c.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{c.nombre}</p>
                    <p className="text-xs text-ink-muted truncate">{c.email}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-warm text-ink-muted border border-edge flex-shrink-0">
                    Sin perfil
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Estado vacío */}
        {clientes.length === 0 && (
          <div className="bg-surface border border-edge rounded-2xl p-12 text-center text-ink-muted">
            Aún no hay clientes registrados.
          </div>
        )}

      </main>
    </div>
  )
}
