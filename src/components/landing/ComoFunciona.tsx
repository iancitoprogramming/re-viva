const GOLD    = '#C9A84C'
const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'

const pasos = [
  {
    num: '01',
    titulo: 'Primero elegís el plan',
    desc: 'Revisás los precios acá abajo, elegís el que mejor se adapta a tu objetivo y hacés clic en "Quiero este plan". Sin cuenta previa.',
  },
  {
    num: '02',
    titulo: 'Después te registrás y completás tu perfil',
    desc: 'Creás tu cuenta y respondés preguntas sobre tu cuerpo, hábitos y objetivo. El motor IGZ analiza tu situación. Tarda menos de 5 minutos.',
  },
  {
    num: '03',
    titulo: 'Realizás el pago',
    desc: 'Pagás por transferencia bancaria o Mercado Pago. Enviás el comprobante y en 24–72 hs hábiles activamos tu proceso.',
  },
  {
    num: '04',
    titulo: 'Tu plan llega personalizado',
    desc: 'Tu trainer diseña un protocolo personalizado: alimentación, entrenamiento, suplementación, meal prep y lista de compras. Lo recibís en 24–72 hs.',
  },
]

export default function ComoFunciona() {
  return (
    <section
      data-reveal
      className="px-6 py-20"
      style={{
        background:
          'radial-gradient(ellipse at 80% 20%, rgba(201,168,76,0.05) 0%, transparent 50%), #0a0a08',
      }}
    >
      <div className="max-w-2xl mx-auto">
        <div data-reveal-child className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3"
             style={{ color: GOLD }}>
            El proceso
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl mb-3"
              style={{ color: IVORY }}>
            Así funciona.
          </h2>
          <p className="text-base max-w-sm mx-auto"
             style={{ color: IVORY60 }}>
            Primero entendés qué ofrezco. Después decidís.
          </p>
        </div>

        <div className="flex flex-col">
          {pasos.map((paso, i) => (
            <div key={paso.num} data-reveal-child className="flex gap-5">
              {/* Indicador de paso */}
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: '#1B3D2F', border: `1px solid rgba(201,168,76,0.25)` }}
                >
                  <span className="text-xs font-bold font-mono" style={{ color: GOLD }}>
                    {paso.num}
                  </span>
                </div>
                {i < pasos.length - 1 && (
                  <div
                    className="w-px flex-1 my-2"
                    style={{ background: 'rgba(201,168,76,0.15)' }}
                  />
                )}
              </div>

              {/* Contenido del paso */}
              <div className={i < pasos.length - 1 ? 'pb-10' : 'pb-0'}>
                <h3 className="font-serif text-xl mb-1" style={{ color: IVORY }}>
                  {paso.titulo}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: IVORY60 }}>
                  {paso.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
