const terminos = [
  'El espacio presencial reserva agenda mensual.',
  'Las ausencias no modifican automáticamente el valor del plan.',
  'Las recuperaciones están sujetas a disponibilidad de agenda.',
  'Los planes presenciales son procesos intensivos y finitos. Máximo dos ciclos por persona.',
  'Finalizados los ciclos presenciales, la continuidad pasa a modalidad online.',
]

export default function Terminos() {
  return (
    <section className="px-6 py-16 bg-ivory border-y border-edge">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl text-ink mb-6">Lo que necesitás saber.</h2>
        <ul className="flex flex-col gap-3">
          {terminos.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gold mt-[0.45rem] flex-shrink-0" />
              <span className="text-ink-secondary text-sm leading-relaxed">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
