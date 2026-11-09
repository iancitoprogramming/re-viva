import Link from 'next/link'

const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY50 = 'rgba(245,242,231,0.50)'
const DIVIDER = 'rgba(201,168,76,0.10)'

const terminos = [
  'Débito automático: cancelás cuando quieras desde Mercado Pago o por WhatsApp.',
  '10 días de arrepentimiento y garantía Re-Viva de 30 días en planes con seguimiento.',
  'El espacio presencial reserva agenda mensual.',
  'Las ausencias no modifican automaticamente el valor del plan.',
  'Las recuperaciones estan sujetas a disponibilidad de agenda.',
  'Los planes presenciales son procesos intensivos y finitos. Maximo dos ciclos por persona.',
  'Finalizados los ciclos presenciales, la continuidad pasa a modalidad online.',
]

export default function Terminos() {
  return (
    <section
      className="px-6 py-16"
      style={{
        background: '#0a0a08',
        borderTop: `1px solid ${DIVIDER}`,
        borderBottom: `1px solid ${DIVIDER}`,
      }}
    >
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl mb-6" style={{ color: IVORY }}>
          Lo que necesitas saber.
        </h2>
        <ul className="flex flex-col gap-3">
          {terminos.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="w-1.5 h-1.5 rounded-full mt-[0.45rem] flex-shrink-0"
                style={{ background: GOLD }}
              />
              <span className="text-sm leading-relaxed" style={{ color: IVORY50 }}>{t}</span>
            </li>
          ))}
        </ul>
        <Link href="/terminos" className="inline-block mt-6 text-sm underline" style={{ color: GOLD }}>
          Leer términos y condiciones completos
        </Link>
      </div>
    </section>
  )
}
