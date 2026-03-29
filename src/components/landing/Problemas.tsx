const problemas = [
  {
    num: '01',
    titulo: 'Llevás meses intentando cambiar y siempre terminás en el mismo lugar',
    desc: 'YouTube, apps genéricas, rutinas de Instagram. Nada funciona porque nada fue diseñado para vos.',
  },
  {
    num: '02',
    titulo: 'Los resultados no llegan y no sabés qué estás haciendo mal',
    desc: 'Sin estructura calórica clara ni seguimiento real, el cuerpo no responde. La motivación cae sola.',
  },
  {
    num: '03',
    titulo: 'No tenés tiempo para entender todo lo que rodea al entrenamiento',
    desc: 'Tenés trabajo, familia y responsabilidades. La alimentación y la recuperación siempre quedan en segundo plano.',
  },
  {
    num: '04',
    titulo: 'Arrancás bien y a los 30 días ya no existe el hábito',
    desc: 'Sin acompañamiento ni plan claro, el ciclo se repite. No es falta de voluntad — es falta de estructura.',
  },
]

export default function Problemas() {
  return (
    <section className="px-6 py-24 bg-ivory">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-4">El problema real</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
            ¿Cuánto tiempo llevás<br className="hidden sm:block" /> intentando cambiar?
          </h2>
          <p className="text-ink-secondary text-base max-w-md leading-relaxed">
            La mayoría arranca con motivación y termina en el mismo lugar. No porque no pueda — sino porque nadie le dio la estructura correcta.
          </p>
        </div>

        {/* Lista de problemas */}
        <div className="flex flex-col divide-y divide-edge">
          {problemas.map((p) => (
            <div key={p.num} className="py-6 flex gap-5 items-start group">
              <span className="font-mono text-xs font-bold text-gold/70 mt-1 flex-shrink-0 w-6">{p.num}</span>
              <div>
                <h3 className="font-semibold text-ink text-base mb-1.5 leading-snug">{p.titulo}</h3>
                <p className="text-ink-secondary text-sm leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Cierre */}
        <div className="mt-12 pt-8 border-t border-edge">
          <p className="font-serif text-xl sm:text-2xl text-ink leading-snug">
            Si llegaste hasta acá, ya sabés que algo tiene que cambiar.{' '}
            <span className="text-primary">Para eso existe REVIVA.</span>
          </p>
        </div>

      </div>
    </section>
  )
}
