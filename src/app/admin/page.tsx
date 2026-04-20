'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

interface Cliente {
  id: string
  nombre: string
  email: string
  creadoEn: string
  plan: { estado: 'PENDIENTE' | 'ACTIVO' | 'ARCHIVADO' } | null
  tienePerfil: boolean
}

const estadoColores = {
  PENDIENTE: 'bg-amber-100 text-amber-700',
  ACTIVO:    'bg-emerald-100 text-emerald-700',
  ARCHIVADO: 'bg-gray-100 text-gray-500',
}

export default function AdminPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [nombreAdmin, setNombreAdmin] = useState('')

  useEffect(() => {
    // Verificar que es admin
    fetch('/api/auth/me').then(res => res.json()).then(data => {
      if (!data.esAdmin) { router.push('/dashboard'); return }
      setNombreAdmin(data.nombre)
    })

    // Cargar clientes
    fetch('/api/admin/clientes')
      .then(res => { if (!res.ok) { router.push('/dashboard'); return null } return res.json() })
      .then(data => { if (data) { setClientes(data); setLoading(false) } })
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const pendientes = clientes.filter(c => c.plan?.estado === 'PENDIENTE' || (!c.plan && c.tienePerfil))
  const activos    = clientes.filter(c => c.plan?.estado === 'ACTIVO')
  const sinPerfil  = clientes.filter(c => !c.tienePerfil)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar nombreUsuario={nombreAdmin} esAdmin />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Panel de Admin</h1>
          <div className="flex gap-3 text-sm">
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-medium">
              {pendientes.length} pendientes
            </span>
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
              {activos.length} activos
            </span>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/admin/templates"
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Templates</p>
              <p className="text-xs text-gray-400">Planes base + IA</p>
            </div>
          </Link>
          <Link href="/admin/foods"
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
            <span className="text-2xl">🥦</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Alimentos</p>
              <p className="text-xs text-gray-400">Catálogo de macros</p>
            </div>
          </Link>
        </div>

        {/* Lista de clientes — cards mobile, tabla desktop */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {clientes.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              Aún no hay clientes registrados.
            </div>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="sm:hidden divide-y divide-gray-50">
                {clientes.map((cliente) => (
                  <div key={cliente.id} className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{cliente.nombre}</p>
                      <p className="text-gray-400 text-xs truncate">{cliente.email}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{new Date(cliente.creadoEn).toLocaleDateString('es-AR')}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!cliente.tienePerfil ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Sin perfil</span>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoColores[cliente.plan?.estado ?? 'PENDIENTE']}`}>
                          {cliente.plan?.estado ?? 'PENDIENTE'}
                        </span>
                      )}
                      {cliente.tienePerfil && (
                        <Link href={`/admin/cliente/${cliente.id}`} className="text-emerald-600 font-semibold text-sm">→</Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: tabla */}
              <table className="w-full text-sm hidden sm:table">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Cliente</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Registrado</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente, i) => (
                    <tr
                      key={cliente.id}
                      className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === clientes.length - 1 ? 'border-0' : ''}`}
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{cliente.nombre}</p>
                        <p className="text-gray-400 text-xs">{cliente.email}</p>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {new Date(cliente.creadoEn).toLocaleDateString('es-AR')}
                      </td>
                      <td className="px-5 py-4">
                        {!cliente.tienePerfil ? (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Sin perfil</span>
                        ) : (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${estadoColores[cliente.plan?.estado ?? 'PENDIENTE']}`}>
                            {cliente.plan?.estado ?? 'PENDIENTE'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {cliente.tienePerfil && (
                          <Link href={`/admin/cliente/${cliente.id}`} className="text-emerald-600 hover:text-emerald-700 font-medium text-xs">
                            Ver →
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
