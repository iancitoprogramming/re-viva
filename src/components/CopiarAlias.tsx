'use client'

import { useState } from 'react'

const ALIAS = 'REVIVA.IGZ'

export default function CopiarAlias() {
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(ALIAS)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      // fallback silencioso
    }
  }

  return (
    <div className="bg-surface border border-edge rounded-3xl p-8 max-w-sm mx-auto shadow-sm">

      {/* Etiqueta */}
      <p className="text-ink-muted text-xs font-semibold tracking-widest uppercase mb-2">
        Alias de transferencia
      </p>

      {/* Alias */}
      <p className="font-serif text-3xl sm:text-4xl text-ink tracking-wide mb-1">
        {ALIAS}
      </p>

      {/* Banco */}
      <p className="text-ink-muted text-xs mb-6">Lemon Cash · CVU / Alias</p>

      {/* Botón */}
      <button
        onClick={copiar}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-all duration-300 active:scale-[0.98] ${
          copiado
            ? 'bg-primary text-ivory'
            : 'bg-gold-light text-ink hover:bg-gold/30 border border-gold/40'
        }`}
      >
        {copiado ? '¡Alias copiado!' : 'Copiar alias'}
      </button>

    </div>
  )
}
