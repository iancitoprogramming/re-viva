import Link from 'next/link'

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
          Re-viví tu cuerpo.<br />
          Re-viví tus hábitos.<br />
          <span className="text-primary">Re-viví tu energía.</span>
        </h1>
        <p className="text-ink-secondary text-base sm:text-lg leading-relaxed mb-10 max-w-md mx-auto">
          Entrenamiento privado con foco en resultados reales, constancia y salud duradera.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/login?modo=registro" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-ivory font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] text-center">
            Empezar ahora
          </Link>
          <Link href="/login" className="w-full sm:w-auto text-primary font-medium px-8 py-4 rounded-2xl text-base border border-primary/25 hover:bg-primary/5 transition-all text-center">
            Ya tengo cuenta
          </Link>
        </div>
      </div>
    </section>
  )
}
