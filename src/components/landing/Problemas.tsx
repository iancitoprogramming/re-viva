const problemas = [
  {
    titulo: 'Probás todo sin saber por dónde empezar',
    desc: 'YouTube, apps genéricas, rutinas de Instagram. Nada funciona porque nada fue diseñado para vos.',
  },
  {
    titulo: 'Los resultados tardan o no llegan',
    desc: 'Sin estructura calórica clara ni seguimiento real, el cuerpo no responde. La motivación cae sola.',
  },
  {
    titulo: 'Te falta tiempo para entender la nutrición',
    desc: 'Tenés trabajo, familia y responsabilidades. La alimentación queda siempre en segundo plano.',
  },
  {
    titulo: 'Arrancás bien y a los 30 días abandonás',
    desc: 'Sin acompañamiento ni plan claro, el ciclo se repite. No es falta de voluntad — es falta de estructura.',
  },
]

export default function Problemas() {
  return (
    <section className="px-6 py-20 bg-ivory border-b border-edge">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">El problema real</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">¿Te suena conocido?</h2>
          <p className="text-ink-secondary text-base max-w-md mx-auto">
            La mayoría arranca con motivación y termina en el mismo lugar.
            No porque no puedan — sino porque nadie les explicó cómo hacerlo bien.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {problemas.map((p, i) => (
            <div key={i} className="bg-surface-warm rounded-2xl p-6 border border-edge flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-ink text-sm mb-1">{p.titulo}</h3>
                <p className="text-ink-secondary text-xs leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="font-serif text-xl text-ink">
            Para eso existe <span className="text-primary">REVIVA.</span>
          </p>
        </div>

      </div>
    </section>
  )
}
