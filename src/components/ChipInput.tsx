'use client'

import { useState } from 'react'

// Input para listas de strings cortas (alergias, lesiones, medicación, etc).
// El usuario tipea, presiona Enter o coma, y se agrega como chip.
// Las chips se pueden remover con × o con Backspace cuando el input está vacío.

interface ChipInputProps {
  label: string
  hint?: string
  placeholder?: string
  values: string[]
  onChange: (values: string[]) => void
  maxChips?: number
  sugerencias?: string[] // chips opcionales clickables para acelerar entrada
}

export default function ChipInput({
  label, hint, placeholder, values, onChange, maxChips = 20, sugerencias = [],
}: ChipInputProps) {
  const [draft, setDraft] = useState('')

  function commit(v: string) {
    const limpio = v.trim().replace(/,$/, '').trim()
    if (!limpio) return
    if (values.includes(limpio)) { setDraft(''); return }
    if (values.length >= maxChips) return
    onChange([...values, limpio])
    setDraft('')
  }

  function remove(idx: number) {
    onChange(values.filter((_, i) => i !== idx))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      commit(draft)
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      remove(values.length - 1)
    }
  }

  function handleBlur() {
    if (draft.trim()) commit(draft)
  }

  const sugerenciasNoUsadas = sugerencias.filter(s => !values.includes(s))

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-secondary">{label}</label>
      {hint && <p className="text-xs text-ink-muted -mt-0.5 mb-0.5">{hint}</p>}

      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl border border-edge bg-surface-warm focus-within:bg-surface focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-colors min-h-[44px]">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm font-medium px-2.5 py-1 rounded-lg"
          >
            {v}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-primary/70 hover:text-primary leading-none text-base"
              aria-label={`Quitar ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={values.length === 0 ? (placeholder ?? 'Escribí y presioná Enter') : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-ink outline-none py-1"
        />
      </div>

      {sugerenciasNoUsadas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {sugerenciasNoUsadas.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className="text-xs px-2 py-0.5 rounded-md border border-edge text-ink-secondary hover:border-primary hover:text-primary transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
