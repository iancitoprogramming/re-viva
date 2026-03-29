const etapas = [
  {
    tiempo: 'Semana 1',
    titulo: 'Tenés tu sistema.',
    desc: 'Tu plan alimentario, tu rutina, tu lista de compras y tu guía de meal prep están listos. Dejás de improvisar.',
  },
  {
    tiempo: 'Mes 1',
    titulo: 'El cuerpo empieza a responder.',
    desc: 'Los hábitos se instalan. Dormís mejor, tenés más energía y empezás a ver cambios reales en el espejo.',
  },
  {
    tiempo: 'Mes 3',
    titulo: 'No reconocés la persona que eras antes.',
    desc: 'La disciplina ya no es un esfuerzo. Es quien sos. El proceso te transformó de adentro hacia afuera.',
  },
]

export default function Transformacion() {
  return (
    <section className="px-6 py-24 bg-surface-warm">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-14">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-4">El proceso</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
            Así luce el cambio<br className="hidden sm:block" /> cuando hay estructura.
          </h2>
          <p className="text-ink-secondary text-base max-w-md leading-relaxed">
            No es magia ni motivación. Es un método que funciona cuando alguien lo aplica con acompañamiento real.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-primary/15 hidden sm:block" />

          <div className="flex flex-col gap-10">
            {etapas.map((e, i) => (
              <div key={i} className="flex gap-6 items-start">
                {/* Dot */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm relative z-10">
                  <span className="text-ivory text-xs font-bold font-mono">{String(i + 1).padStart(2, '0')}</span>
                </div>
                {/* Content */}
                <div className="pb-2">
                  <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-1">{e.tiempo}</p>
                  <h3 className="font-serif text-xl text-ink mb-2">{e.titulo}</h3>
                  <p className="text-ink-secondary text-sm leading-relaxed max-w-sm">{e.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quote */}
        <div className="mt-16 bg-primary rounded-2xl px-8 py-8">
          <p className="font-serif text-xl sm:text-2xl text-ivory leading-snug mb-3">
            "Controla tu cuerpo.<br />Controla tu vida."
          </p>
          <p className="text-ivory/50 text-xs uppercase tracking-widest">Principio REVIVA</p>
        </div>

      </div>
    </section>
  )
}
