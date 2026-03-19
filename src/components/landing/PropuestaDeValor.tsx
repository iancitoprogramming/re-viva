const pilares = [
  { numero: '01', titulo: 'Proceso',        desc: 'Un método con estructura clara, seguimiento personalizado y adaptación constante. Cada etapa tiene un propósito.' },
  { numero: '02', titulo: 'Acompañamiento', desc: 'Tu trainer está con vos. No hay automatismos: hay decisiones tomadas para tu caso específico.' },
  { numero: '03', titulo: 'Continuidad',    desc: 'Los hábitos se construyen con el tiempo. REVIVA te acompaña más allá de los ciclos presenciales.' },
]

export default function PropuestaDeValor() {
  return (
    <section className="px-6 py-20 bg-ivory">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">Más que un plan. Un proceso.</h2>
          <p className="text-ink-secondary text-base max-w-sm mx-auto">
            Lo que diferencia a REVIVA es la continuidad, la estructura y el acompañamiento real.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {pilares.map((p) => (
            <div key={p.numero} className="bg-surface rounded-2xl p-7 border border-edge">
              <span className="text-gold font-mono text-sm font-bold tracking-widest">{p.numero}</span>
              <h3 className="font-serif text-xl text-ink mt-3 mb-2">{p.titulo}</h3>
              <p className="text-ink-secondary text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
