import Link from 'next/link'
import { INSTAGRAM_URL, PLAN_CTA_HREF } from '@/lib/constants'

// ─── INSTRUCCIONES PARA AGREGAR FOTOS ────────────────────────────────────────
// 1. Descargá las fotos de Instagram y guardalas en /public/resultados/
// 2. Nombralas: cliente-1-antes.jpg, cliente-1-despues.jpg, etc.
// 3. Reemplazá `null` por la ruta: '/resultados/cliente-1-antes.jpg'
// 4. Completá nombre, objetivo y descripción de cada transformación

interface Resultado {
  id: number
  nombre: string        // Nombre o iniciales del cliente
  objetivo: string      // "Definición", "Volumen", "Recomposición"
  tiempo: string        // "3 meses", "90 días", etc.
  descripcion: string   // Frase breve del proceso
  fotoAntes: string | null   // ej: '/resultados/cliente-1-antes.jpg'
  fotoDespues: string | null // ej: '/resultados/cliente-1-despues.jpg'
}

const resultados: Resultado[] = [
  {
    id: 1,
    nombre: 'Cliente 1',
    objetivo: 'Definición',
    tiempo: '3 meses',
    descripcion: 'Perdió grasa, ganó definición muscular y mejoró su energía diaria.',
    fotoAntes: null,
    fotoDespues: null,
  },
  {
    id: 2,
    nombre: 'Cliente 2',
    objetivo: 'Recomposición',
    tiempo: '90 días',
    descripcion: 'Recompuso su cuerpo sin dieta extrema. Comió mejor y entrenó con método.',
    fotoAntes: null,
    fotoDespues: null,
  },
  {
    id: 3,
    nombre: 'Cliente 3',
    objetivo: 'Volumen',
    tiempo: '4 meses',
    descripcion: 'Ganó masa muscular real con una estructura calórica y proteica clara.',
    fotoAntes: null,
    fotoDespues: null,
  },
]

function ResultadoCard({ r }: { r: Resultado }) {
  const tieneFotos = r.fotoAntes && r.fotoDespues

  return (
    <div className="bg-surface rounded-2xl border border-edge overflow-hidden shadow-sm">

      {/* Fotos antes/después */}
      {tieneFotos ? (
        <div className="grid grid-cols-2 divide-x divide-edge">
          <div className="relative aspect-[3/4] overflow-hidden">
            <img src={r.fotoAntes!} alt={`${r.nombre} antes`} className="w-full h-full object-cover object-top" />
            <span className="absolute bottom-2 left-2 text-xs font-semibold bg-ink/60 text-ivory px-2 py-0.5 rounded-md backdrop-blur-sm">
              Antes
            </span>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden">
            <img src={r.fotoDespues!} alt={`${r.nombre} después`} className="w-full h-full object-cover object-top" />
            <span className="absolute bottom-2 right-2 text-xs font-semibold bg-primary/80 text-ivory px-2 py-0.5 rounded-md backdrop-blur-sm">
              {r.tiempo}
            </span>
          </div>
        </div>
      ) : (
        // Placeholder — se reemplaza cuando haya fotos
        <div className="aspect-[16/9] bg-surface-warm flex flex-col items-center justify-center gap-2 border-b border-edge">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="w-6 h-6 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-ink-muted text-xs">Foto próximamente</p>
        </div>
      )}

      {/* Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-primary uppercase tracking-wider">{r.objetivo}</span>
          <span className="text-xs text-ink-muted">{r.tiempo}</span>
        </div>
        <p className="text-ink text-sm leading-relaxed">{r.descripcion}</p>
      </div>

    </div>
  )
}

export default function Resultados() {
  const hayFotos = resultados.some(r => r.fotoAntes && r.fotoDespues)

  return (
    <section className="px-6 py-24 bg-ivory">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-4">Resultados reales</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-ink leading-tight">
              Esto es lo que pasa<br className="hidden sm:block" /> cuando hay método.
            </h2>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-semibold text-primary border border-primary/25 px-5 py-2.5 rounded-xl hover:bg-primary/5 transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Ver más en Instagram
          </a>
        </div>

        {/* Grid de resultados */}
        {hayFotos ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resultados.map(r => <ResultadoCard key={r.id} r={r} />)}
          </div>
        ) : (
          // Estado sin fotos — CTA a Instagram
          <div className="bg-surface-warm border border-edge rounded-3xl p-10 text-center">
            <p className="font-serif text-xl text-ink mb-3">
              Los resultados están en Instagram.
            </p>
            <p className="text-ink-secondary text-sm mb-6 max-w-xs mx-auto leading-relaxed">
              Seguí <strong>@igztrainer</strong> para ver transformaciones reales de clientes que pasaron por el proceso.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-ivory font-semibold px-6 py-3 rounded-xl text-sm transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
                Ver en Instagram
              </a>
              <Link
                href={PLAN_CTA_HREF}
                className="inline-flex items-center justify-center gap-2 border border-primary/25 text-primary font-semibold px-6 py-3 rounded-xl text-sm transition-all hover:bg-primary/5"
              >
                Empezar mi proceso →
              </Link>
            </div>
          </div>
        )}

      </div>
    </section>
  )
}
