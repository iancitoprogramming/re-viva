'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import FormInput from '@/components/FormInput'
import Button from '@/components/Button'

// Separamos el contenido que usa useSearchParams en su propio componente
// para que Next.js pueda envolverlo en Suspense correctamente
function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const resetOk      = searchParams.get('resetOk') === '1'
  const [modo, setModo] = useState<'login' | 'registro'>(
    searchParams.get('modo') === 'registro' ? 'registro' : 'login'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({ nombre: '', email: '', password: '' })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url  = modo === 'login' ? '/api/auth/login' : '/api/auth/register'
    const body = modo === 'login'
      ? { email: form.email, password: form.password }
      : { nombre: form.nombre, email: form.email, password: form.password }

    try {
      const res  = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Ocurrió un error. Intentá de nuevo.')
        return
      }

      if (data.esAdmin) {
        router.push('/admin')
      } else if (!data.tienePerfil) {
        router.push('/onboarding')
      } else if (data.planEstado === 'PENDIENTE') {
        router.push('/pendiente')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Error de conexión. Revisá tu internet e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory flex flex-col">

      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/">
          <span className="font-serif font-bold text-xl text-primary tracking-wide">REVIVA</span>
          <span className="text-ink-muted text-xs ml-2 tracking-widest uppercase">by IGZ Trainer</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-surface rounded-3xl border border-edge shadow-sm p-8">

            <h1 className="font-serif text-2xl text-ink mb-1">
              {modo === 'login' ? 'Bienvenido de vuelta.' : 'Empezar el proceso.'}
            </h1>
            <p className="text-ink-secondary text-sm mb-7">
              {modo === 'login'
                ? 'Ingresá con tu email y contraseña.'
                : 'Completá los datos para crear tu cuenta.'}
            </p>

            {resetOk && (
              <p className="text-sm text-primary bg-primary/8 px-4 py-3 rounded-xl border border-primary/20 mb-5">
                ✓ Contraseña actualizada. Podés iniciar sesión.
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {modo === 'registro' && (
                <FormInput
                  label="Nombre completo"
                  name="nombre"
                  type="text"
                  placeholder="Juan Pérez"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              )}

              <FormInput
                label="Email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <FormInput
                label="Contraseña"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                  {error}
                </p>
              )}

              <Button type="submit" loading={loading} className="w-full py-4 mt-1 text-base rounded-2xl">
                {modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
              </Button>

            </form>

            {modo === 'login' && (
              <p className="text-center text-sm mt-4">
                <Link href="/recuperar" className="text-ink-muted hover:text-primary transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            )}

            <p className="text-center text-sm text-ink-secondary mt-4">
              {modo === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
              <button
                onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError('') }}
                className="text-primary font-semibold hover:underline"
              >
                {modo === 'login' ? 'Registrate' : 'Iniciá sesión'}
              </button>
            </p>

          </div>
        </div>
      </main>

    </div>
  )
}

// Envolvemos en Suspense porque LoginContent usa useSearchParams
export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
