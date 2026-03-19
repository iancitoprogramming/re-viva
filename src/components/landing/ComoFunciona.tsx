const pasos = [
  { num: '01', titulo: 'Registrate',         desc: 'Creá tu cuenta en menos de un minuto.' },
  { num: '02', titulo: 'Completá tu perfil', desc: 'Respondé preguntas sobre tu cuerpo, hábitos y objetivo. El motor IGZ analiza tu situación.' },
  { num: '03', titulo: 'Realizá el pago',    desc: 'Transferí al alias REVIVA.IGZ y enviá el comprobante por WhatsApp. Así se activa tu proceso.' },
  { num: '04', titulo: 'Tu plan llega',      desc: 'Tu trainer diseña un protocolo personalizado. Lo recibís en las 24 a 72 horas hábiles siguientes.' },
]

export default function ComoFunciona() {
  return (
    <section className="px-6 py-20 bg-surface-warm">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">Cuatro pasos. Un proceso real.</h2>
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
