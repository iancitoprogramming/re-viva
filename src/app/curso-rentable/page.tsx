// /curso-rentable — Landing dedicada del curso "Personal Trainer Rentable"
// Producto digital, entrega manual por WhatsApp tras pago confirmado.

import type { Metadata } from 'next'
import Link from 'next/link'
import { PLANES_MP } from '@/lib/constants'
import LandingHeader from '@/components/landing/LandingHeader'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata: Metadata = {
  title: 'Curso — Personal Trainer Rentable | Re-Viva by Ian Gutiérrez',
  description:
    'El sistema completo para que ser entrenador deje de ser un hobby y se transforme en un negocio real. Captación, conversión, retención y modelo de ingresos.',
}

const GOLD = '#C9A84C'

const plan = PLANES_MP['ebook-rentable']

const PUNTOS_DOLOR = [
  'Trabajás 10 horas, cobrás como si fueran 4',
  'Tus clientes desaparecen al mes y no sabés por qué',
  'Subís precios, perdés clientes, los bajás otra vez',
  'No tenés tiempo de hacer tu propio entrenamiento',
  'Querés vender online pero no sabés ni por dónde empezar',
  'Cobrás sesión por sesión y nunca llegás a un piso fijo',
]

const QUE_INCLUYE = [
  {
    titulo: 'Capítulo 1 — Tu posicionamiento',
    bullets: [
      'Cómo dejar de ser "uno más" en el rubro',
      'Definir tu nicho real (no el que querés tener)',
      'Construir autoridad sin tener 100k seguidores',
    ],
  },
  {
    titulo: 'Capítulo 2 — Precio y valor',
    bullets: [
      'Cuánto cobrar por cada servicio y por qué',
      'Cómo manejar objeciones de precio sin bajar el ticket',
      'El error más común al fijar precios (y cómo corregirlo)',
    ],
  },
  {
    titulo: 'Capítulo 3 — Conversión',
    bullets: [
      'Cómo presentar tu propuesta sin que parezca venta',
      'Qué hace que un cliente diga sí (y qué lo frena)',
      'Plantilla de propuesta lista para usar',
    ],
  },
  {
    titulo: 'Capítulo 4 — Retención',
    bullets: [
      'Por qué los clientes se van (y la mayoría no es el plan)',
      'Sistema de check-ins que multiplica la permanencia',
      'Cómo construir una comunidad que se cuida sola',
    ],
  },
  {
    titulo: 'Capítulo 5 — Modelo de ingresos',
    bullets: [
      'Mix entre presencial, online y productos digitales',
      'Cuánto cobrar por cada cosa y por qué',
      'Cómo escalar sin clonarte ni quemarte',
    ],
  },
  {
    titulo: 'Bonus',
    bullets: [
      'Plantillas de mensajes para consultas, seguimiento y retención',
      'Calculadora de pricing por hora real (con costos ocultos)',
      'Tabla de benchmarks reales del mercado argentino 2026',
    ],
  },
]

const PARA_QUIEN = {
  si: [
    'Sos entrenador hace al menos 1 año y querés profesionalizarlo',
    'Tenés clientes pero no llegás a fin de mes con holgura',
    'Querés salir del modelo "hora-trabajada-hora-cobrada"',
    'Estás dispuesto a ejecutar, no solo a leer',
  ],
  no: [
    'Recién arrancás y nunca tuviste clientes propios',
    'Buscás un curso técnico de programación de entrenamiento',
    'Esperás un atajo mágico sin trabajo de tu parte',
    'No querés cambiar nada de cómo venís haciendo las cosas',
  ],
}

const FAQ = [
  {
    q: '¿En qué formato lo recibo?',
    a: 'Es un PDF descargable. Una vez que confirmemos el pago, te lo enviamos directo por WhatsApp en menos de 24 horas hábiles. No hay videos — está pensado para que lo leas en una tarde y empieces a aplicar al día siguiente.',
  },
  {
    q: '¿Por qué se entrega por WhatsApp y no por mail?',
    a: 'Porque el contacto inicial nos sirve para ubicarte en nuestra base, mandarte updates si actualizamos el material, y porque preferimos que arranques con un canal abierto con nosotros desde el primer día.',
  },
  {
    q: '¿Cuánto tiempo tarda en mostrar resultados?',
    a: 'Si aplicás lo del modelo de precios y la parte de retención, los primeros cambios se notan en la primera o segunda semana. El modelo de ingresos escalable suele empezar a moverse a los 30-60 días.',
  },
  {
    q: '¿Sirve para entrenadores de Argentina o también de afuera?',
    a: 'Los principios sirven en cualquier mercado. Los benchmarks de pricing y los ejemplos están adaptados al mercado argentino 2026, pero la lógica de precios, retención y modelo de ingresos es universal.',
  },
  {
    q: '¿Hay garantía?',
    a: 'Si en los primeros 7 días leés el curso, aplicás aunque sea un capítulo y no te suma nada, te devolvemos el 100%. Te pedimos solo una cosa: que muestres que lo leíste.',
  },
  {
    q: '¿Por qué este precio?',
    a: 'Estamos en pre-venta. El precio sube a $79.900 cuando termine el lanzamiento. Quienes compran en pre-venta también acceden a las próximas actualizaciones del PDF sin costo extra.',
  },
]

const tieneDescuento = 'montoOriginal' in plan && typeof plan.montoOriginal === 'number' && plan.montoOriginal > plan.monto
const ahorro = tieneDescuento ? plan.montoOriginal! - plan.monto : 0
const pctAhorro = tieneDescuento ? Math.round((ahorro / plan.montoOriginal!) * 100) : 0

export default function CursoRentablePage() {
  return (
    <main className="min-h-screen bg-[#0a0a08] text-[#f5f2e7]">
      <LandingHeader />

      {/* HERO */}
      <section className="relative px-4 pt-20 pb-24 md:pt-32 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 30% 20%, ${GOLD}15 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${GOLD}08 0%, transparent 50%)`,
          }}
        />
        <div className="max-w-4xl mx-auto relative">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-5 px-3 py-1.5 rounded-full" style={{ color: GOLD, border: `1px solid ${GOLD}40`, background: `${GOLD}10` }}>
            Para entrenadores · Pre-venta
          </span>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 text-white">
            Personal Trainer<br/>
            <span style={{ color: GOLD }}>Rentable</span>
          </h1>
          <p className="text-lg md:text-2xl text-[#f5f2e7]/70 mb-10 max-w-2xl leading-relaxed">
            El sistema que te saca del modelo &quot;hora-cobrada-hora-trabajada&quot; y te lleva a un negocio real, escalable y rentable.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href={`/checkout?plan=ebook-rentable`}
              className="bg-[#C9A84C] hover:bg-[#b8943d] text-[#0a0a08] font-bold text-base px-8 py-4 rounded-xl transition-all shadow-2xl shadow-[#C9A84C]/20 hover:shadow-[#C9A84C]/40"
            >
              Quiero acceder al curso →
            </Link>
            <div className="flex items-baseline gap-3">
              {tieneDescuento && (
                <span className="text-[#f5f2e7]/40 line-through text-lg">
                  ${plan.montoOriginal!.toLocaleString('es-AR')}
                </span>
              )}
              <span className="text-2xl md:text-3xl font-bold text-white">
                ${plan.monto.toLocaleString('es-AR')}
              </span>
              {tieneDescuento && (
                <span className="text-xs font-bold uppercase px-2 py-1 rounded-md" style={{ background: GOLD, color: '#0a0a08' }}>
                  -{pctAhorro}%
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-[#f5f2e7]/40 mt-3">Pago único · Garantía 7 días · PDF entregado por WhatsApp</p>
        </div>
      </section>

      {/* PUNTOS DE DOLOR */}
      <section className="px-4 py-20 bg-[#0d0d0a] border-y border-[#C9A84C]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl mb-3 text-white">¿Te suena alguna de estas?</h2>
          <p className="text-[#f5f2e7]/60 mb-10 text-lg">Si tildás más de 2, este curso es para vos.</p>
          <ul className="grid md:grid-cols-2 gap-3 md:gap-4">
            {PUNTOS_DOLOR.map((punto, i) => (
              <li key={i} className="flex items-start gap-3 bg-[#0a0a08] border border-[#C9A84C]/10 rounded-xl px-4 py-3">
                <span className="flex-shrink-0 mt-0.5 text-red-400">✗</span>
                <span className="text-[#f5f2e7]/85 text-sm md:text-base">{punto}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* QUÉ INCLUYE */}
      <section className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: GOLD }}>Lo que vas a aprender</p>
          <h2 className="font-serif text-3xl md:text-5xl mb-12 text-white">5 capítulos + bonus<br/>aplicables desde el día 1</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {QUE_INCLUYE.map((cap, i) => (
              <div key={i} className="bg-[#0d0d0a] border border-[#C9A84C]/15 rounded-2xl p-6 hover:border-[#C9A84C]/40 transition-colors">
                <p className="font-serif text-xl text-white mb-3">{cap.titulo}</p>
                <ul className="space-y-2">
                  {cap.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-[#f5f2e7]/70 leading-relaxed">
                      <span style={{ color: GOLD }} className="mt-0.5 flex-shrink-0">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUIÉN ES */}
      <section className="px-4 py-20 bg-[#0d0d0a] border-y border-[#C9A84C]/10">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl mb-12 text-white">¿Es para vos?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#0a0a08] border-2 rounded-2xl p-6" style={{ borderColor: `${GOLD}30` }}>
              <p className="font-bold text-lg mb-4" style={{ color: GOLD }}>SÍ es para vos si...</p>
              <ul className="space-y-3">
                {PARA_QUIEN.si.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#f5f2e7]/85 text-sm">
                    <span className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#0a0a08] border-2 border-red-900/40 rounded-2xl p-6">
              <p className="font-bold text-lg text-red-300 mb-4">NO te lo recomiendo si...</p>
              <ul className="space-y-3">
                {PARA_QUIEN.no.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#f5f2e7]/70 text-sm">
                    <span className="text-red-400 flex-shrink-0 mt-0.5">✗</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* AUTORIDAD */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: GOLD }}>Quién lo escribe</p>
          <h2 className="font-serif text-3xl md:text-4xl mb-6 text-white">Ian Gutiérrez · IGZ Trainer</h2>
          <p className="text-[#f5f2e7]/70 leading-relaxed text-base md:text-lg">
            Personal trainer, coach ontológico y emprendedor del fitness. Construyó Re-Viva, una plataforma de coaching que combina entrenamiento físico, nutrición aplicada y desarrollo personal. Trabajó con clientes en Argentina, España y EE.UU., y desde 2023 sistematiza el modelo que usa para que cualquier entrenador con compromiso pueda llegar a vivir con holgura de su profesión.
          </p>
        </div>
      </section>

      {/* PRICING + CTA */}
      <section className="px-4 py-20 bg-gradient-to-b from-[#0d0d0a] to-[#0a0a08] border-y border-[#C9A84C]/15">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-5 px-3 py-1.5 rounded-full" style={{ color: GOLD, border: `1px solid ${GOLD}40`, background: `${GOLD}10` }}>
            Pre-venta · Tiempo limitado
          </span>
          <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">Empezá hoy</h2>
          <div className="flex items-baseline justify-center gap-4 mb-3">
            {tieneDescuento && (
              <span className="text-[#f5f2e7]/40 line-through text-2xl">
                ${plan.montoOriginal!.toLocaleString('es-AR')}
              </span>
            )}
            <span className="text-5xl md:text-6xl font-bold text-white">
              ${plan.monto.toLocaleString('es-AR')}
            </span>
          </div>
          <p className="text-[#f5f2e7]/60 mb-2">Pago único en pesos argentinos</p>
          {tieneDescuento && (
            <p className="text-sm font-semibold mb-8" style={{ color: GOLD }}>
              Ahorrás ${ahorro.toLocaleString('es-AR')} ({pctAhorro}% off de pre-venta)
            </p>
          )}
          <Link
            href={`/checkout?plan=ebook-rentable`}
            className="inline-block bg-[#C9A84C] hover:bg-[#b8943d] text-[#0a0a08] font-bold text-lg px-10 py-5 rounded-xl transition-all shadow-2xl shadow-[#C9A84C]/30 hover:shadow-[#C9A84C]/50"
          >
            Comprar ahora →
          </Link>
          <div className="mt-8 grid grid-cols-3 gap-3 text-xs text-[#f5f2e7]/60">
            <div className="bg-[#0d0d0a] border border-[#C9A84C]/10 rounded-lg p-3">
              <p className="text-base mb-1">📄</p>
              <p>PDF descargable</p>
            </div>
            <div className="bg-[#0d0d0a] border border-[#C9A84C]/10 rounded-lg p-3">
              <p className="text-base mb-1">💬</p>
              <p>Entrega por WhatsApp</p>
            </div>
            <div className="bg-[#0d0d0a] border border-[#C9A84C]/10 rounded-lg p-3">
              <p className="text-base mb-1">🛡️</p>
              <p>Garantía 7 días</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-5xl mb-10 text-white">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQ.map((f, i) => (
              <details key={i} className="bg-[#0d0d0a] border border-[#C9A84C]/15 rounded-2xl px-5 py-4 group hover:border-[#C9A84C]/30 transition-colors">
                <summary className="font-semibold text-white cursor-pointer list-none flex items-start justify-between gap-3">
                  <span>{f.q}</span>
                  <span className="flex-shrink-0 transition-transform group-open:rotate-180" style={{ color: GOLD }}>▾</span>
                </summary>
                <p className="text-[#f5f2e7]/70 leading-relaxed mt-4 text-sm">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-4 py-24 bg-[#0d0d0a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-5xl mb-5 text-white">
            Dejá de cobrar por hora.<br/>
            <span style={{ color: GOLD }}>Empezá a cobrar por valor.</span>
          </h2>
          <p className="text-[#f5f2e7]/70 mb-10 text-lg">
            Si lo que venís haciendo no te trae los resultados que querés, tiene sentido cambiar el método.
          </p>
          <Link
            href={`/checkout?plan=ebook-rentable`}
            className="inline-block bg-[#C9A84C] hover:bg-[#b8943d] text-[#0a0a08] font-bold text-lg px-10 py-5 rounded-xl transition-all shadow-2xl shadow-[#C9A84C]/30"
          >
            Acceder al curso por ${plan.monto.toLocaleString('es-AR')}
          </Link>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}
