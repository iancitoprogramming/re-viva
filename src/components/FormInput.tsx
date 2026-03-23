'use client'

// Inputs reutilizables — REVIVA Design System

import { useState } from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function FormInput({ label, error, className = '', type, ...props }: FormInputProps) {
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === 'password'
  const inputType  = isPassword && showPass ? 'text' : type

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          type={inputType}
          className={`w-full px-4 py-3 rounded-xl border text-sm text-ink bg-surface transition-colors
            ${error
              ? 'border-red-400 focus:ring-red-400 bg-red-50'
              : 'border-edge focus:border-primary focus:ring-primary/20'
            }
            focus:outline-none focus:ring-2 focus:ring-offset-0
            placeholder:text-ink-muted
            disabled:bg-surface-warm disabled:text-ink-muted
            ${isPassword ? 'pr-11' : ''}
            ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            tabIndex={-1}
            aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition-colors p-0.5 cursor-pointer"
          >
            {showPass ? (
              /* Ojo tachado — contraseña visible */
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              /* Ojo abierto — contraseña oculta */
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}


// Select reutilizable con el mismo estilo
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: { value: string; label: string }[]
}

export function FormSelect({ label, error, options, className = '', ...props }: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <select
        className={`w-full px-4 py-3 rounded-xl border text-sm text-ink bg-surface transition-colors appearance-none
          ${error
            ? 'border-red-400 focus:ring-red-400 bg-red-50'
            : 'border-edge focus:border-primary focus:ring-primary/20'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${className}`}
        {...props}
      >
        <option value="">Seleccioná una opción</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
