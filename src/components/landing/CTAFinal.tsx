import Link from 'next/link'
import WhatsAppIcon from '@/components/WhatsAppIcon'
import { WHATSAPP_CONSULTA, PLAN_CTA_HREF } from '@/lib/constants'

export default function CTAFinal() {
  return (
    <section className="px-6 py-24 text-center" style={{ background: 'linear-gradient(to bottom, #1C3D28, #2D5A3D)' }}>
      <div className="max-w-xl mx-auto">
        <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-5">Proceso real. Resultados reales.</p>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#EDE8DF] mb-4 leading-tight">
          Tu proceso empieza<br />cuando vos decidís.
        </h2>
        <p className="text-[#EDE8DF]/60 text-base mb-10">Sin presión. Solo el primer paso.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href={PLAN_CTA_HREF}
            className="w-full sm:w-auto inline-block bg-gold hover:bg-gold/90 text-ink font-semibold px-10 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] text-center"
          >
            Empezar ahora
          </Link>
          <a
            href={WHATSAPP_CONSULTA}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#EDE8DF]/10 hover:bg-[#EDE8DF]/20 border border-[#EDE8DF]/20 text-[#EDE8DF] font-medium px-8 py-4 rounded-2xl text-base transition-all text-center"
          >
            <WhatsAppIcon />
            Consultar antes
          </a>
        </div>
      </div>
    </section>
  )
}
