'use client'

import { useEffect, useState } from 'react'
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

export default function AdminPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [nombreAdmin, setNombreAdmin] = useState('')

  useEffect(() => {
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (!data.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(data.nombre)
    })

    fetch('/api/admin/clientes')
      .then(res => { if (!res.ok) { router.push('/dashboard'); return null } return res.json() })
      .then(data => { if (data) { setClientes(data); setLoading(false) } })
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

      <main className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-serif text-2xl text-ink">Panel REVIVA</h1>
          <p className="text-ink-muted text-sm mt-0.5">
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
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
