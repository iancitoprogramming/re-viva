import CopiarAlias from '@/components/CopiarAlias'

export default function Pagos() {
  return (
    <section className="px-6 py-20 bg-surface-warm" id="pagos">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">Empezar es simple.</h2>
        <p className="text-ink-secondary text-base mb-10 max-w-sm mx-auto">
          Una vez que elegís tu plan, realizá la transferencia al siguiente alias:
        </p>
        <CopiarAlias />
        <p className="text-ink-muted text-sm mt-6 max-w-xs mx-auto">
          Tu plan queda activo dentro de las 24 a 72 horas hábiles de acreditado el pago.
        </p>
      </div>
    </section>
  )
}
