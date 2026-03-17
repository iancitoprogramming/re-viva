// Inputs reutilizables — REVIVA Design System

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export default function FormInput({ label, error, className = '', ...props }: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-ink-secondary">
        {label}
      </label>
      <input
        className={`w-full px-4 py-3 rounded-xl border text-sm text-ink bg-surface transition-colors
          ${error
            ? 'border-red-400 focus:ring-red-400 bg-red-50'
            : 'border-edge focus:border-primary focus:ring-primary/20'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-0
          placeholder:text-ink-muted
          disabled:bg-surface-warm disabled:text-ink-muted
          ${className}`}
        {...props}
      />
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
