// Landing page — REVIVA by IGZ Trainer
// Server component. Los elementos interactivos están en componentes client separados.

import Link from 'next/link'
import PlanesTabs from '@/components/PlanesTabs'
import CopiarAlias from '@/components/CopiarAlias'

const INSTAGRAM_URL = 'https://instagram.com/igztrainer'

// ─── HEADER ──────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-edge">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          <span className="font-serif font-bold text-xl text-primary tracking-wide">REVIVA</span>
          <span className="text-ink-muted text-xs ml-2 tracking-widest uppercase">by IGZ Trainer</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="#planes"
            className="hidden sm:block text-sm text-ink-secondary hover:text-primary font-medium transition-colors"
          >
            Ver planes
          </Link>
          <Link
            href="/login"
            className="text-sm text-ink-secondary hover:text-primary font-medium transition-colors"
          >
            Ingresar
          </Link>
        </div>
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
          Controlá tu cuerpo.<br />
          Controlá tu vida.<br />
          <span className="text-primary">Sin vueltas.</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-ink-secondary text-base sm:text-lg leading-relaxed mb-10 max-w-md mx-auto">
          Plan nutricional y de entrenamiento 100% personalizado.
          Diseñado para personas con poco tiempo y resultados reales como objetivo.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
          <Link
            href="#planes"
            className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-ivory font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98] text-center"
          >
            Ver planes y precios
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-primary font-medium px-8 py-4 rounded-2xl text-base border border-primary/25 hover:bg-primary/5 transition-all text-center"
          >
            Ver más en Instagram
          </a>
        </div>

        {/* Acceso rápido para clientes existentes */}
        <p className="text-ink-muted text-sm">
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Ingresá acá
          </Link>
        </p>

      </div>
    </section>
  )
}

// ─── PROBLEMAS COMUNES ────────────────────────────────────────────────────────

const problemas = [
  {
    titulo: 'Probás todo sin saber por dónde empezar',
    desc: 'YouTube, apps genéricas, rutinas de Instagram. Nada funciona porque nada fue diseñado para vos.',
  },
  {
    titulo: 'Los resultados tardan o no llegan',
    desc: 'Sin estructura calórica clara ni seguimiento real, el cuerpo no responde. La motivación cae sola.',
  },
  {
    titulo: 'Te falta tiempo para entender la nutrición',
    desc: 'Tenés trabajo, familia y responsabilidades. La alimentación queda siempre en segundo plano.',
  },
  {
    titulo: 'Arrancás bien y a los 30 días abandonás',
    desc: 'Sin acompañamiento ni plan claro, el ciclo se repite. No es falta de voluntad — es falta de estructura.',
  },
]

function Problemas() {
  return (
    <section className="px-6 py-20 bg-ivory border-b border-edge">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">El problema real</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            ¿Te suena conocido?
          </h2>
          <p className="text-ink-secondary text-base max-w-md mx-auto">
            La mayoría arranca con motivación y termina en el mismo lugar.
            No porque no puedan — sino porque nadie les explicó cómo hacerlo bien.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {problemas.map((p, i) => (
            <div key={i} className="bg-surface-warm rounded-2xl p-6 border border-edge flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                <svg className="w-4 h-4 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-ink text-sm mb-1">{p.titulo}</h3>
                <p className="text-ink-secondary text-xs leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transición a la solución */}
        <div className="mt-10 text-center">
          <p className="font-serif text-xl text-ink">
            Para eso existe <span className="text-primary">REVIVA.</span>
          </p>
        </div>

      </div>
    </section>
  )
}

// ─── LO QUE INCLUYE CADA PLAN ─────────────────────────────────────────────────

const incluidoEnTodosLosPlanes = [
  {
    titulo: 'Plan alimentario',
    desc: 'Estructura calórica y de macros adaptada a tu perfil y objetivo.',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    titulo: 'Rutina de entrenamiento',
    desc: 'Programa diseñado para tu nivel, frecuencia y disponibilidad.',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    titulo: 'Guía de suplementación',
    desc: 'Qué usar, cuándo y cómo. Sin humo, con criterio.',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    titulo: 'Guía de meal prep',
    desc: 'Cómo organizar tu semana para que la alimentación no sea un problema.',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    titulo: 'Lista de compras semanal',
    desc: 'Todo lo que necesitás comprar para seguir el plan sin complicaciones.',
    icon: (
      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
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
              <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                {item.icon}
              </div>
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
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">Precios</p>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">
            Elegí tu punto de partida.
          </h2>
          <p className="text-ink-secondary text-base max-w-sm mx-auto">
            Cada plan es un proceso. No una clase suelta.
          </p>
        </div>

        <PlanesTabs />

        {/* Aclaración post-planes */}
        <p className="text-center text-ink-muted text-sm mt-8">
          Al hacer clic en "Quiero este plan" vas a crear tu cuenta y completar tu perfil.
          Tu plan se activa dentro de las 24–72 hs de acreditado el pago.
        </p>

      </div>
    </section>
  )
}

// ─── CÓMO FUNCIONA ────────────────────────────────────────────────────────────

const pasos = [
  {
    num: '01',
    titulo: 'Elegís tu plan',
    desc: 'Revisás los precios, elegís el que mejor se adapta a tu objetivo y hacés clic en "Quiero este plan".',
  },
  {
    num: '02',
    titulo: 'Creás tu cuenta y completás tu perfil',
    desc: 'Respondés preguntas sobre tu cuerpo, hábitos y objetivo. Tarda menos de 5 minutos. El motor IGZ analiza tu situación.',
  },
  {
    num: '03',
    titulo: 'Tu plan llega personalizado',
    desc: 'Ian diseña tu protocolo completo. Lo recibís dentro de las 24–72 horas hábiles de acreditado el pago.',
  },
]

function ComoFunciona() {
  return (
    <section className="px-6 py-20 bg-surface-warm">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">El proceso</p>
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

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="#planes"
            className="inline-block bg-gold hover:bg-gold/90 text-ink font-semibold px-10 py-4 rounded-2xl text-base transition-all duration-200 active:scale-[0.98]"
          >
            Ver planes
          </Link>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-ivory/30 hover:bg-ivory/10 text-ivory font-medium px-10 py-4 rounded-2xl text-base transition-all duration-200"
          >
            Ver en Instagram
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
          <Link href="#planes"         className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Planes</Link>
          <Link href="#pagos"          className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Pagos</Link>
          <a    href={INSTAGRAM_URL}   target="_blank" rel="noopener noreferrer" className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Instagram</a>
          <Link href="/login"          className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Ingresar</Link>
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
        <Problemas />
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
