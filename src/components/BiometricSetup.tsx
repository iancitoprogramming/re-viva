'use client'

import { useState, useEffect } from 'react'

const GOLD = '#C9A84C'

export default function BiometricSetup() {
  const [available, setAvailable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const check = async () => {
      try {
        const ok = await window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable()
        setAvailable(!!ok)
      } catch {
        setAvailable(false)
      }
    }
    check()
  }, [])

  if (!available) return null

  async function handleActivar() {
    setLoading(true)
    setStatus('idle')
    setMsg('')
    try {
      const { startRegistration } = await import('@simplewebauthn/browser')
      const optRes = await fetch('/api/auth/webauthn/register-options', { method: 'POST' })
      if (!optRes.ok) { setStatus('error'); setMsg('Error al obtener opciones.'); return }
      const options = await optRes.json()
      const regResponse = await startRegistration({ optionsJSON: options })
      const verifyRes = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regResponse),
      })
      if (verifyRes.ok) {
        setStatus('success')
        setMsg('Biometría activada. La próxima vez podés entrar sin contraseña.')
      } else {
        const data = await verifyRes.json()
        setStatus('error')
        setMsg(data.error ?? 'Error al registrar biometría.')
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setMsg('Cancelado.')
      } else {
        setStatus('error')
        setMsg('Error al registrar. Intentá de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      style={{ borderColor: 'rgba(201,168,76,0.15)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div>
        <p className="text-sm font-semibold text-white">Inicio biométrico</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(245,242,231,0.5)' }}>
          {status === 'success'
            ? msg
            : 'Activá el acceso con huella o Face ID en este dispositivo.'}
        </p>
        {status === 'error' && (
          <p className="text-xs mt-1" style={{ color: '#f87171' }}>{msg}</p>
        )}
      </div>

      {status !== 'success' && (
        <button
          onClick={handleActivar}
          disabled={loading}
          className="flex-shrink-0 text-sm font-semibold px-4 py-2 rounded-xl border transition-all disabled:opacity-50"
          style={{ borderColor: `${GOLD}40`, color: GOLD, background: 'rgba(201,168,76,0.08)' }}
        >
          {loading ? 'Activando...' : 'Activar'}
        </button>
      )}
    </div>
  )
}
