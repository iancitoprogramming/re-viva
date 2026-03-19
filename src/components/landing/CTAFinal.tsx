import Link from 'next/link'

const WA_ICON = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"

export default function CTAFinal() {
  return (
    <section className="px-6 py-24 text-center" style={{ background: 'linear-gradient(to bottom, #1C3D28, #2D5A3D)' }}>
      <div className="max-w-xl mx-auto">
        <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-5">Proceso real. Resultados reales.</p>
        <h2 className="font-serif text-3xl sm:text-4xl text-ivory mb-4 leading-tight">
          Tu proceso empieza<br />cuando vos decidís.
        </h2>
        <p className="text-ivory/60 text-base mb-10">Sin presión. Solo el primer paso.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/login?modo=registro"
            className="w-full sm:w-auto inline-block bg-gold hover:bg-gold/90 text-ink font-semibold px-10 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] text-center"
          >
            Empezar ahora
          </Link>
          <a
            href="https://wa.me/5491122835621?text=Hola%20Ian%2C%20tengo%20una%20consulta%20sobre%20REVIVA."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-ivory font-medium px-8 py-4 rounded-2xl text-base transition-all text-center"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d={WA_ICON} />
            </svg>
            Consultar antes
          </a>
        </div>
      </div>
    </section>
  )
}
