// Landing page — REVIVA by IGZ Trainer
// Server component. Los elementos interactivos están en componentes client separados.

import Link from 'next/link'
import PlanesTabs from '@/components/PlanesTabs'
import CopiarAlias from '@/components/CopiarAlias'

// ─── HEADER ──────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-edge">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          <span className="font-serif font-bold text-xl text-primary tracking-wide">REVIVA</span>
          <span className="text-ink-muted text-xs ml-2 tracking-widest uppercase">by IGZ Trainer</span>
        </div>
        <Link
          href="/login"
          className="text-sm text-ink-secondary hover:text-primary font-medium transition-colors"
        >
          Ingresar
        </Link>
      </div>
    </header>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section
      className="min-h-[calc(100svh-64px)] flex flex-col justify-center px-6 py-20"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(45,90,61,0.07) 0%, transparent 65%), #F8F5EF',
      }}
    >
      <div className="max-w-xl mx-auto w-full text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gold-light text-primary-dark text-xs font-semibold px-4 py-1.5 rounded-full mb-8 border border-gold/40 tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-gold inline-block" />
          Método IGZ Trainer
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl text-ink leading-[1.2] mb-6">
          Re-viví tu cuerpo.<br />
          Re-viví tus hábitos.<br />
          <span className="text-primary">Re-viví tu energía.</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-ink-secondary text-base sm:text-lg leading-relaxed mb-10 max-w-md mx-auto">
          Entrenamiento privado con foco en resultados reales,
          constancia y salud duradera.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/login"
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-ivory font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] text-center"
          >
            Empezar ahora
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto text-primary font-medium px-8 py-4 rounded-2xl text-base border border-primary/25 hover:bg-primary/5 transition-all text-center"
          >
            Ya tengo cuenta
          </Link>
        </div>

      </div>
    </section>
  )
}

// ─── LO QUE INCLUYE CADA PLAN ─────────────────────────────────────────────────

const incluidoEnTodosLosPlanes = [
  { icono: '🥗', titulo: 'Plan alimentario',        desc: 'Estructura calórica y de macros adaptada a tu perfil y objetivo.' },
  { icono: '💪', titulo: 'Rutina de entrenamiento', desc: 'Programa diseñado para tu nivel, frecuencia y disponibilidad.' },
  { icono: '💊', titulo: 'Guía de suplementación',  desc: 'Qué usar, cuándo y cómo. Sin humo, con criterio.' },
  { icono: '🍱', titulo: 'Guía de meal prep',        desc: 'Cómo organizar tu semana para que la alimentación no sea un problema.' },
  { icono: '🛒', titulo: 'Lista de compras semanal', desc: 'Todo lo que necesitás comprar para seguir el plan sin complicaciones.' },
]

function QueIncluye() {
  return (
    <section className="px-6 py-20 bg-surface-warm">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Incluido en todos los planes</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            No es solo entrenamiento.
          </h2>
          <p className="text-ink-secondary text-base max-w-md mx-auto">
            Cada proceso REVIVA incluye los cinco componentes que hacen posible un cambio real y sostenible.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {incluidoEnTodosLosPlanes.map((item) => (
            <div key={item.titulo} className="bg-surface rounded-2xl p-6 border border-edge flex gap-4">
              <span className="text-2xl flex-shrink-0">{item.icono}</span>
              <div>
                <h3 className="font-semibold text-ink text-sm mb-1">{item.titulo}</h3>
                <p className="text-ink-secondary text-xs leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}

          {/* Card de cierre — proceso integral */}
          <div className="bg-primary rounded-2xl p-6 border border-primary sm:col-span-2 lg:col-span-1 flex flex-col justify-between gap-4">
            <p className="font-serif text-xl text-ivory leading-snug">
              Alimentación + Entrenamiento + Acompañamiento.
            </p>
            <p className="text-ivory/70 text-xs leading-relaxed">
              Todo en un mismo proceso. Diseñado para vos. Sin extras. Sin módulos aparte.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}

// ─── PROPUESTA DE VALOR ───────────────────────────────────────────────────────

const pilares = [
  {
    numero: '01',
    titulo: 'Proceso',
    desc: 'Un método con estructura clara, seguimiento personalizado y adaptación constante. Cada etapa tiene un propósito.',
  },
  {
    numero: '02',
    titulo: 'Acompañamiento',
    desc: 'Tu trainer está con vos. No hay automatismos: hay decisiones tomadas para tu caso específico.',
  },
  {
    numero: '03',
    titulo: 'Continuidad',
    desc: 'Los hábitos se construyen con el tiempo. REVIVA te acompaña más allá de los ciclos presenciales.',
  },
]

function PropuestaDeValor() {
  return (
    <section className="px-6 py-20 bg-ivory">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            Más que un plan. Un proceso.
          </h2>
          <p className="text-ink-secondary text-base max-w-sm mx-auto">
            Lo que diferencia a REVIVA es la continuidad, la estructura y el acompañamiento real.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {pilares.map((p) => (
            <div key={p.numero} className="bg-surface rounded-2xl p-7 border border-edge">
              <span className="text-gold font-mono text-sm font-bold tracking-widest">{p.numero}</span>
              <h3 className="font-serif text-xl text-ink mt-3 mb-2">{p.titulo}</h3>
              <p className="text-ink-secondary text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

// ─── PLANES ───────────────────────────────────────────────────────────────────

function Planes() {
  return (
    <section className="px-6 py-20 bg-ivory" id="planes">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            Elegí tu punto de partida.
          </h2>
          <p className="text-ink-secondary text-base max-w-sm mx-auto">
            Cada plan es un proceso. No una clase suelta.
          </p>
        </div>

        <PlanesTabs />

      </div>
    </section>
  )
}

// ─── CÓMO FUNCIONA ────────────────────────────────────────────────────────────

const pasos = [
  {
    num: '01',
    titulo: 'Registrate',
    desc: 'Creá tu cuenta en menos de un minuto.',
  },
  {
    num: '02',
    titulo: 'Completá tu perfil',
    desc: 'Respondé preguntas sobre tu cuerpo, hábitos y objetivo. El motor IGZ analiza tu situación.',
  },
  {
    num: '03',
    titulo: 'Realizá el pago',
    desc: 'Transferí al alias REVIVA.IGZ y enviá el comprobante por WhatsApp. Así se activa tu proceso.',
  },
  {
    num: '04',
    titulo: 'Tu plan llega',
    desc: 'Tu trainer diseña un protocolo personalizado. Lo recibís en las 24 a 72 horas hábiles siguientes.',
  },
]

function ComoFunciona() {
  return (
    <section className="px-6 py-20 bg-surface-warm">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            Tres pasos. Un proceso real.
          </h2>
        </div>

        <div className="flex flex-col">
          {pasos.map((paso, i) => (
            <div key={paso.num} className="flex gap-5">

              {/* Indicador visual */}
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-ivory text-xs font-bold font-mono">{paso.num}</span>
                </div>
                {i < pasos.length - 1 && (
                  <div className="w-px flex-1 bg-primary/20 my-2" />
                )}
              </div>

              {/* Texto */}
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

// ─── TÉRMINOS ─────────────────────────────────────────────────────────────────

const terminos = [
  'El espacio presencial reserva agenda mensual.',
  'Las ausencias no modifican automáticamente el valor del plan.',
  'Las recuperaciones están sujetas a disponibilidad de agenda.',
  'Los planes presenciales son procesos intensivos y finitos. Máximo dos ciclos por persona.',
  'Finalizados los ciclos presenciales, la continuidad pasa a modalidad online.',
]

function Terminos() {
  return (
    <section className="px-6 py-16 bg-ivory border-y border-edge">
      <div className="max-w-2xl mx-auto">

        <h2 className="font-serif text-2xl text-ink mb-6">
          Lo que necesitás saber.
        </h2>

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

// ─── PAGOS ────────────────────────────────────────────────────────────────────

function Pagos() {
  return (
    <section className="px-6 py-20 bg-surface-warm" id="pagos">
      <div className="max-w-xl mx-auto text-center">

        <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
          Empezar es simple.
        </h2>
        <p className="text-ink-secondary text-base mb-10 max-w-sm mx-auto">
          Una vez que elegís tu plan, realizá la transferencia al siguiente alias:
        </p>

        <CopiarAlias />

        <p className="text-ink-muted text-sm mt-6 max-w-xs mx-auto">
          Tu plan queda activo dentro de las 24 a 72 horas hábiles de acreditado el pago.
        </p>

      </div>
    </section>
  )
}

// ─── CTA FINAL ────────────────────────────────────────────────────────────────

function CTAFinal() {
  return (
    <section
      className="px-6 py-24 text-center"
      style={{ background: 'linear-gradient(to bottom, #1C3D28, #2D5A3D)' }}
    >
      <div className="max-w-xl mx-auto">

        <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-5">
          Proceso real. Resultados reales.
        </p>

        <h2 className="font-serif text-3xl sm:text-4xl text-ivory mb-4 leading-tight">
          Tu proceso empieza<br />cuando vos decidís.
        </h2>

        <p className="text-ivory/60 text-base mb-10">
          Sin presión. Solo el primer paso.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            href="/login"
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
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            Consultar antes
          </a>
        </div>

      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="px-6 py-8 bg-primary-dark">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">

        <div>
          <span className="font-serif font-bold text-ivory/90 tracking-wide">REVIVA</span>
          <span className="text-ivory/40 text-xs ml-2">by IGZ Trainer</span>
        </div>

        <div className="flex gap-6">
          <Link href="#planes" className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Planes</Link>
          <Link href="#pagos"  className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Pagos</Link>
          <a href="https://instagram.com/igztrainer" target="_blank" rel="noopener noreferrer" className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Instagram</a>
          <Link href="/login"  className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Ingresar</Link>
        </div>

        <p className="text-ivory/25 text-xs">
          © {new Date().getFullYear()} REVIVA · IGZ Trainer
        </p>

      </div>
    </footer>
  )
}

// ─── PÁGINA ───────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <QueIncluye />
        <PropuestaDeValor />
        <Planes />
        <ComoFunciona />
        <Terminos />
        <Pagos />
        <CTAFinal />
      </main>
      <Footer />
    </>
  )
}
