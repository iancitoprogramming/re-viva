'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'

interface NavbarProps {
  nombreUsuario?: string
  esAdmin?: boolean
}

export default function Navbar({ nombreUsuario, esAdmin }: NavbarProps) {
  const router = useRouter()

  async function cerrarSesion() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">

        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-emerald-600 font-bold text-lg">Re-Viva</span>
          <span className="text-gray-400 text-xs font-medium">by IGZ Trainer</span>
        </Link>

        <div className="flex items-center gap-2">
          {esAdmin && (
            <Link
              href="/admin"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg"
            >
              Panel Admin
            </Link>
          )}
          {nombreUsuario && (
            <span className="text-sm text-gray-600 hidden sm:block">
              Hola, <strong>{nombreUsuario}</strong>
            </span>
          )}
          <ThemeToggle />
          <button
            onClick={cerrarSesion}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            Salir
          </button>
        </div>

      </div>
    </nav>
  )
}
