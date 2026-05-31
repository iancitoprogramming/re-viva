const GOLD = '#C9A84C'
const IVORY30 = 'rgba(245,242,231,0.30)'
const DIVIDER = 'rgba(201,168,76,0.12)'

const credenciales = [
  'Programacion DUP',
  'Mifflin-St Jeor',
  'ACSM Position Stand 2025',
  'Periodizacion ondulante',
  'Nutricion basada en evidencia',
]

export default function Metodologia() {
  return (
    <section
      className="px-6 py-5 overflow-hidden"
      style={{ background: '#0a0a08', borderTop: `1px solid ${DIVIDER}`, borderBottom: `1px solid ${DIVIDER}` }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <span
            className="text-[10px] font-bold tracking-[0.25em] uppercase whitespace-nowrap flex-shrink-0"
            style={{ color: GOLD }}
          >
            Metodologia
          </span>
          <div className="w-px h-4 flex-shrink-0" style={{ background: DIVIDER }} />
          {credenciales.map((c, i) => (
            <span key={i} className="flex items-center gap-4 flex-shrink-0">
              <span
                className="text-xs font-medium tracking-wide whitespace-nowrap"
                style={{ color: IVORY30 }}
              >
                {c}
              </span>
              {i < credenciales.length - 1 && (
                <span className="text-xs" style={{ color: 'rgba(201,168,76,0.20)' }}>·</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
