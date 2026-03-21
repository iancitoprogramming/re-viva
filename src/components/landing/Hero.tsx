import Link from 'next/link'

const INSTAGRAM_URL = 'https://instagram.com/igztrainer'

export default function Hero() {
  return (
    <section
      className="min-h-[calc(100svh-64px)] flex flex-col justify-center px-6 py-20"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(45,90,61,0.07) 0%, transparent 65%), var(--color-ivory)' }}
    >
      <div className="max-w-xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 bg-gold-light text-primary-dark text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-gold/40 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
          Método IGZ Trainer
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-ink leading-[1.2] mb-6">
          Controlá tu cuerpo.<br />
          Controlá tu vida.<br />
          <span className="text-primary">Sin vueltas.</span>
        </h1>
        <p className="text-ink-secondary text-base sm:text-lg leading-relaxed mb-10 max-w-md mx-auto">
          Plan nutricional y de entrenamiento 100% personalizado.
          Diseñado para personas con poco tiempo y resultados reales como objetivo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
          <Link
            href="#planes"
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-ivory font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] text-center"
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
        <p className="text-ink-muted text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Ingresá acá
          </Link>
        </p>
      </div>
    </section>
  )
}
