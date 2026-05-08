'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import FormInput from '@/components/FormInput'
import Button from '@/components/Button'

function LoginContent() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const resetOk      = searchParams.get('resetOk') === '1'
  // redirect: solo aceptar paths internos (empieza con / y no contiene ://)
  const redirectRaw  = searchParams.get('redirect') ?? ''
  const redirectTo   = redirectRaw.startsWith('/') && !redirectRaw.includes('://') ? redirectRaw : null
  const [modo, setModo] = useState<'login' | 'registro'>(
    searchParams.get('modo') === 'registro' ? 'registro' : 'login'
  )
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [form, setForm]               = useState({ nombre: '', email: '', password: '' })
  const [biometricLoading, setBiometricLoading] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)

  useEffect(() => {
    if (modo === 'login' && typeof window !== 'undefined') {
      const check = async () => {
        try {
          const available = await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable()
          setBiometricAvailable(!!available)
        } catch {
          setBiometricAvailable(false)
        }
      }
      check()
    }
  }, [modo])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleBiometric() {
    if (!form.email) { setError('Ingresá tu email primero para usar biometría.'); return }
    setBiometricLoading(true)
    setError('')
    try {
      const { startAuthentication } = await import('@simplewebauthn/browser')
      const optRes = await fetch('/api/auth/webauthn/login-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      })
      if (!optRes.ok) { setError('No hay biometría registrada para este email.'); return }
      const options = await optRes.json()
      const authResponse = await startAuthentication({ optionsJSON: options })
      const loginRes = await fetch('/api/auth/webauthn/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, response: authResponse }),
      })
      const data = await loginRes.json()
      if (!loginRes.ok) { setError(data.error ?? 'Error de autenticación biométrica.'); return }
      if (redirectTo) return router.push(redirectTo)
      if (data.esAdmin) return router.push('/admin')
      if (!data.tienePerfil) return router.push('/onboarding')
      if (data.planEstado === 'PENDIENTE') {
        const nombre = data.nombre ? `?nombre=${encodeURIComponent(data.nombre.split(' ')[0])}` : ''
        return router.push(`/pendiente${nombre}`)
      }
      router.push('/dashboard')
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setError('Biometría cancelada.')
      } else {
        setError('Error al usar biometría. Iniciá sesión con contraseña.')
      }
    } finally {
      setBiometricLoading(false)
    }
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

      if (redirectTo) {
        router.push(redirectTo)
      } else if (data.esAdmin) {
        router.push('/admin')
      } else if (!data.tienePerfil) {
        router.push('/onboarding')
      } else if (data.planEstado === 'PENDIENTE') {
        const nombre = data.nombre ? `?nombre=${encodeURIComponent(data.nombre.split(' ')[0])}` : ''
        router.push(`/pendiente${nombre}`)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Error de conexión. Revisá tu internet e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const GOLD    = '#C9A84C'
  const IVORY   = '#F5F2E7'
  const IVORY60 = 'rgba(245,242,231,0.60)'
  const IVORY35 = 'rgba(245,242,231,0.35)'
  const GLASS   = 'rgba(255,255,255,0.04)'
  const BORDER  = 'rgba(201,168,76,0.15)'

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          'radial-gradient(ellipse at 60% 10%, rgba(201,168,76,0.06) 0%, transparent 50%), radial-gradient(ellipse at 20% 80%, rgba(27,61,47,0.10) 0%, transparent 50%), #0a0a08',
      }}
    >

      <header className="px-6 py-5 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Link href="/">
          <span className="font-serif font-bold text-xl tracking-wide" style={{ color: GOLD }}>REVIVA</span>
          <span className="text-xs ml-2 tracking-widest uppercase" style={{ color: IVORY35 }}>by IGZ Trainer</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div
            className="rounded-3xl p-8"
            style={{ background: GLASS, border: `1px solid ${BORDER}`, backdropFilter: 'blur(16px)' }}
          >

            <h1 className="font-serif text-2xl mb-1" style={{ color: IVORY }}>
              {modo === 'login' ? 'Bienvenido de vuelta.' : 'Creá tu cuenta.'}
            </h1>
            <p className="text-sm mb-7" style={{ color: IVORY60 }}>
              {modo === 'login'
                ? 'Ingresá con tu email y contraseña para acceder a tu plan.'
                : 'Es el primer paso. Tarda menos de un minuto.'}
            </p>

            {resetOk && (
              <p
                className="text-sm px-4 py-3 rounded-xl mb-5"
                style={{
                  color: GOLD,
                  background: 'rgba(201,168,76,0.08)',
                  border: '1px solid rgba(201,168,76,0.22)',
                }}
              >
                ✓ Contraseña actualizada. Podés iniciar sesión.
              </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {modo === 'registro' && (
                <FormInput
                  dark
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
                dark
                label="Email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />

              <FormInput
                dark
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
                <p
                  className="text-sm px-4 py-3 rounded-xl"
                  style={{
                    color: '#f87171',
                    background: 'rgba(248,113,113,0.08)',
                    border: '1px solid rgba(248,113,113,0.22)',
                  }}
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-1 text-base rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                style={{ background: GOLD, color: '#0a0a08' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Procesando...
                  </span>
                ) : (
                  modo === 'login' ? 'Ingresar' : 'Crear cuenta y empezar'
                )}
              </button>

            </form>

            {modo === 'login' && biometricAvailable && (
              <>
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-px" style={{ background: BORDER }} />
                  <span className="text-xs" style={{ color: IVORY35 }}>o</span>
                  <div className="flex-1 h-px" style={{ background: BORDER }} />
                </div>
                <button
                  type="button"
                  onClick={handleBiometric}
                  disabled={biometricLoading}
                  className="w-full py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2.5 border disabled:opacity-50"
                  style={{ border: `1px solid ${BORDER}`, background: GLASS, color: IVORY }}
                >
                  {biometricLoading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 2C9.38 2 7 3.68 7 6v1H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-2V6c0-2.32-2.38-4-5-4z"/>
                      <circle cx="12" cy="14" r="2"/>
                    </svg>
                  )}
                  {biometricLoading ? 'Verificando...' : 'Ingresar con biometría'}
                </button>
              </>
            )}

            {modo === 'login' && (
              <p className="text-center text-sm mt-4">
                <Link
                  href="/recuperar"
                  className="transition-colors"
                  style={{ color: IVORY35 }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </p>
            )}

            <p className="text-center text-sm mt-4" style={{ color: IVORY60 }}>
              {modo === 'login' ? '¿No tenés cuenta?' : '¿Ya tenés cuenta?'}{' '}
              <button
                onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError('') }}
                className="font-semibold hover:underline cursor-pointer"
                style={{ color: GOLD }}
              >
                {modo === 'login' ? 'Registrate gratis' : 'Iniciá sesión'}
              </button>
            </p>

          </div>

          {modo === 'registro' && (
            <p className="text-center text-xs mt-4 px-4" style={{ color: IVORY35 }}>
              Tu cuenta queda lista al instante. El plan se activa una vez confirmado el pago.
            </p>
          )}

        </div>
      </main>

    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
