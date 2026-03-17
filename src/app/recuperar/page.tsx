'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import FormInput from '@/components/FormInput'
import Button from '@/components/Button'

type Paso = 'email' | 'codigo'

export default function RecuperarPage() {
  const router = useRouter()
  const [paso, setPaso]         = useState<Paso>('email')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [email, setEmail]       = useState('')
  const [codigo, setCodigo]     = useState('')
  const [nuevaPass, setNuevaPass] = useState('')

  // ── Paso 1: enviar código ──
  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/auth/recuperar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Ocurrió un error.')
        return
      }
      setPaso('codigo')
    } catch {
      setError('Error de conexión. Revisá tu internet.')
    } finally {
      setLoading(false)
    }
  }

  // ── Paso 2: verificar código y cambiar contraseña ──
  async function resetPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo, nuevaPassword: nuevaPass }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Código inválido o expirado.')
        return
      }
      router.push('/login?resetOk=1')
    } catch {
      setError('Error de conexión. Revisá tu internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">

      <header className="px-6 py-5 max-w-5xl mx-auto w-full">
        <Link href="/">
          <span className="font-serif font-bold text-xl text-primary tracking-wide">REVIVA</span>
          <span className="text-ink-muted text-xs ml-2 tracking-widest uppercase">by IGZ Trainer</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-3xl border border-edge shadow-sm p-8">

            {paso === 'email' ? (
              <>
                <h1 className="font-serif text-2xl text-ink mb-1">Recuperar contraseña</h1>
                <p className="text-ink-secondary text-sm mb-7">
                  Ingresá tu email y te enviamos un código de 6 dígitos.
                </p>

                <form onSubmit={enviarCodigo} className="flex flex-col gap-4">
                  <FormInput
                    label="Tu email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    required
                  />
                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{error}</p>
                  )}
                  <Button type="submit" loading={loading} className="w-full py-4 text-base rounded-2xl">
                    Enviar código
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h1 className="font-serif text-2xl text-ink mb-1">Ingresá el código</h1>
                <p className="text-ink-secondary text-sm mb-1">
                  Enviamos un código de 6 dígitos a:
                </p>
                <p className="text-primary text-sm font-semibold mb-7">{email}</p>

                <form onSubmit={resetPassword} className="flex flex-col gap-4">

                  {/* Código */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-ink-secondary">Código</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="123456"
                      value={codigo}
                      onChange={e => { setCodigo(e.target.value.replace(/\D/g, '')); setError('') }}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-edge text-center text-2xl font-bold tracking-[0.5em] text-ink bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <FormInput
                    label="Nueva contraseña"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaPass}
                    onChange={e => { setNuevaPass(e.target.value); setError('') }}
                    required
                    minLength={6}
                  />

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{error}</p>
                  )}

                  <Button type="submit" loading={loading} className="w-full py-4 text-base rounded-2xl">
                    Cambiar contraseña
                  </Button>

                  <button
                    type="button"
                    onClick={() => { setPaso('email'); setError(''); setCodigo(''); setNuevaPass('') }}
                    className="text-sm text-ink-secondary hover:text-primary transition-colors text-center"
                  >
                    Usar otro email
                  </button>
                </form>
              </>
            )}

            <p className="text-center text-sm text-ink-secondary mt-6">
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Volver al inicio de sesión
              </Link>
            </p>

          </div>
        </div>
      </main>

    </div>
  )
}
