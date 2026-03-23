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
    desc: 'Transferís al alias REVIVA.IGZ y enviás el comprobante por WhatsApp. Así se activa tu proceso.',
  },
  {
    num: '04',
    titulo: 'Tu plan llega personalizado',
    desc: 'Tu trainer diseña un protocolo personalizado: alimentación, entrenamiento, suplementación, meal prep y lista de compras. Lo recibís en 24–72 hs.',
  },
]

export default function ComoFunciona() {
  return (
    <section className="px-6 py-20 bg-surface-warm">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">El proceso</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">Así funciona.</h2>
          <p className="text-ink-secondary text-base max-w-sm mx-auto">
            Primero entendés qué ofrezco. Después decidís.
          </p>
        </div>
        <div className="flex flex-col">
          {pasos.map((paso, i) => (
            <div key={paso.num} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-ivory text-xs font-bold font-mono">{paso.num}</span>
                </div>
                {i < pasos.length - 1 && <div className="w-px flex-1 bg-primary/20 my-2" />}
              </div>
              <div className={i < pasos.length - 1 ? 'pb-10' : 'pb-0'}>
                <h3 className="font-serif text-xl text-ink mb-1">{paso.titulo}</h3>
                <p className="text-ink-secondary text-sm leading-relaxed">{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
