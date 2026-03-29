import Link from 'next/link'
import { INSTAGRAM_URL } from '@/lib/constants'

export default function Hero() {
  return (
    <section
      className="min-h-[calc(100svh-64px)] flex flex-col justify-center px-6 py-20"
      style={{
        background: 'radial-gradient(ellipse at 50% -10%, rgba(45,90,61,0.12) 0%, transparent 60%), var(--color-ivory)',
      }}
    >
      <div className="max-w-xl mx-auto w-full text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gold-light text-primary-dark text-xs font-semibold px-4 py-1.5 rounded-full mb-10 border border-gold/40 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
          Método IGZ Trainer
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink leading-[1.15] mb-6">
          La persona que<br />
          querés ser<br />
          <span className="text-primary">ya existe.</span>
        </h1>

        {/* Subtext */}
        <p className="text-ink-secondary text-base sm:text-lg leading-relaxed mb-3 max-w-md mx-auto">
          Solo necesita estructura, método y alguien que la acompañe en serio.
        </p>
        <p className="text-ink-muted text-sm mb-10 max-w-xs mx-auto">
          Nutrición + entrenamiento + acompañamiento real. Personalizado para vos.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
          <Link
            href="#planes"
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-ivory font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] text-center shadow-sm"
          >
            Ver planes y precios
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-primary font-medium px-8 py-4 rounded-2xl text-base border border-primary/25 hover:bg-primary/5 transition-all text-center"
          >
            Ver más en Instagram
          </a>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-6 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
            Plan 100% personalizado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
            Resultados en 30 días
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
            Sin contrato
          </span>
        </div>

        <p className="text-ink-muted text-xs mt-8">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Ingresá acá
          </Link>
        </p>
      </div>
    </section>
  )
}
