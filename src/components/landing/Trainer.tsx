import Image from 'next/image'
import { WHATSAPP_CONSULTA } from '@/lib/constants'

const credenciales = [
  'Entrenador personal — años de práctica real con personas reales',
  'Nutrición aplicada — aprendida desde la experiencia y los resultados',
  'Mentalidad y hábitos — el trabajo que nadie te enseña en un aula',
  'Transformaciones que hablan más que cualquier título',
]

export default function Trainer() {
  return (
    <section className="px-6 py-24 bg-ivory">
      <div className="max-w-4xl mx-auto">

        <div className="grid sm:grid-cols-2 gap-12 items-center">

          {/* Foto de Ian */}
          <div className="order-2 sm:order-1">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden relative bg-primary/5">
              <Image
                src="/ian.jpg"
                alt="Ian Gutiérrez — IGZ Trainer"
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Texto */}
          <div className="order-1 sm:order-2">
            <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-4">Quién está detrás de REVIVA</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-tight mb-4">
              Ian Gutiérrez.<br />
              <span className="text-primary">IGZ Trainer.</span>
            </h2>
            <p className="text-ink-secondary text-base leading-relaxed mb-6">
              No trabajo con cualquiera. Trabajo con personas que quieren un cambio real y están dispuestas a comprometerse con el proceso.
            </p>
            <p className="text-ink-secondary text-base leading-relaxed mb-8">
              Mi enfoque combina ciencia del ejercicio, nutrición aplicada y acompañamiento humano. Nada de rutinas genéricas ni planes de internet.
            </p>

            {/* Credenciales */}
            <ul className="flex flex-col gap-2 mb-8">
              {credenciales.map((c, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-ink-secondary">
                  <span className="w-4 h-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            <a
              href={WHATSAPP_CONSULTA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-primary hover:bg-primary-dark text-ivory font-semibold px-6 py-3.5 rounded-2xl text-sm transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Hablar con Ian
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}
