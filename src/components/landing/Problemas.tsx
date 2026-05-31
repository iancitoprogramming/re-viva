const GOLD       = '#C9A84C'
const IVORY      = '#F5F2E7'
const IVORY_60   = 'rgba(245,242,231,0.60)'
const IVORY_55   = 'rgba(245,242,231,0.55)'
const DIVIDER    = 'rgba(201,168,76,0.10)'

const problemas = [
  {
    num: '01',
    titulo: 'Llevas meses intentando cambiar y siempre terminas en el mismo lugar',
    desc: 'YouTube, apps genericas, rutinas de Instagram. Nada funciona porque nada fue disenado para vos.',
  },
  {
    num: '02',
    titulo: 'Los resultados no llegan y no sabes que estas haciendo mal',
    desc: 'Sin estructura calorica clara ni seguimiento real, el cuerpo no responde. La motivacion cae sola.',
  },
  {
    num: '03',
    titulo: 'No tenes tiempo para entender todo lo que rodea al entrenamiento',
    desc: 'Tenes trabajo, familia y responsabilidades. La alimentacion y la recuperacion siempre quedan en segundo plano.',
  },
  {
    num: '04',
    titulo: 'Arrancas bien y a los 30 dias ya no existe el habito',
    desc: 'Sin acompanamiento ni plan claro, el ciclo se repite. No es falta de voluntad — es falta de estructura.',
  },
]

export default function Problemas() {
  return (
    <section
      data-reveal
      className="px-6 py-24"
      style={{
        background:
          'radial-gradient(ellipse at 10% 60%, rgba(201,168,76,0.05) 0%, transparent 50%), #0a0a08',
      }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-14" data-reveal-child>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4"
             style={{ color: GOLD }}>
            El problema real
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl leading-tight mb-4"
              style={{ color: IVORY }}
              data-gold-underline>
            Cuanto tiempo llevas intentando cambiar?
          </h2>
          <p className="text-base max-w-md leading-relaxed"
             style={{ color: IVORY_60 }}>
            La mayoria arranca con motivacion y termina en el mismo lugar. No porque no pueda — sino porque nadie le dio la estructura correcta.
          </p>
        </div>

        {/* Lista de problemas */}
        <div className="flex flex-col" style={{ borderTop: `1px solid ${DIVIDER}` }}>
          {problemas.map((p) => (
            <div
              key={p.num}
              data-reveal-child
              className="py-6 flex gap-5 items-start"
              style={{ borderBottom: `1px solid ${DIVIDER}` }}
            >
              <span className="font-mono text-xs font-bold mt-1 flex-shrink-0 w-6"
                    style={{ color: `${GOLD}99` }}>
                {p.num}
              </span>
              <div>
                <h3 className="font-semibold text-base mb-1.5 leading-snug"
                    style={{ color: IVORY }}>
                  {p.titulo}
                </h3>
                <p className="text-sm leading-relaxed"
                   style={{ color: IVORY_55 }}>
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Cierre */}
        <div data-reveal-child className="mt-12 pt-8" style={{ borderTop: `1px solid ${DIVIDER}` }}>
          <p className="font-serif text-xl sm:text-2xl leading-snug" style={{ color: IVORY }}>
            Si llegaste hasta aca, ya sabes que algo tiene que cambiar.{' '}
            <span style={{ color: GOLD }}>Para eso existe REVIVA.</span>
          </p>
        </div>

      </div>
    </section>
  )
}
