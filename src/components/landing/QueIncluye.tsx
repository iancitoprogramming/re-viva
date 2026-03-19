const items = [
  { icono: '🥗', titulo: 'Plan alimentario',        desc: 'Estructura calórica y de macros adaptada a tu perfil y objetivo.' },
  { icono: '💪', titulo: 'Rutina de entrenamiento', desc: 'Programa diseñado para tu nivel, frecuencia y disponibilidad.' },
  { icono: '💊', titulo: 'Guía de suplementación',  desc: 'Qué usar, cuándo y cómo. Sin humo, con criterio.' },
  { icono: '🍱', titulo: 'Guía de meal prep',        desc: 'Cómo organizar tu semana para que la alimentación no sea un problema.' },
  { icono: '🛒', titulo: 'Lista de compras semanal', desc: 'Todo lo que necesitás comprar para seguir el plan sin complicaciones.' },
]

export default function QueIncluye() {
  return (
    <section className="px-6 py-20 bg-surface-warm">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Incluido en todos los planes</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">No es solo entrenamiento.</h2>
          <p className="text-ink-secondary text-base max-w-md mx-auto">
            Cada proceso REVIVA incluye los cinco componentes que hacen posible un cambio real y sostenible.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.titulo} className="bg-surface rounded-2xl p-6 border border-edge flex gap-4">
              <span className="text-2xl flex-shrink-0">{item.icono}</span>
              <div>
                <h3 className="font-semibold text-ink text-sm mb-1">{item.titulo}</h3>
                <p className="text-ink-secondary text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
          <div className="bg-primary rounded-2xl p-6 border border-primary sm:col-span-2 lg:col-span-1 flex flex-col justify-between gap-4">
            <p className="font-serif text-xl text-ivory leading-snug">Alimentación + Entrenamiento + Acompañamiento.</p>
            <p className="text-ivory/70 text-xs leading-relaxed">Todo en un mismo proceso. Diseñado para vos. Sin extras. Sin módulos aparte.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
