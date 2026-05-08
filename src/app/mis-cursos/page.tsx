import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CURSOS } from '@/lib/cursos'

const GOLD = '#C9A84C'

const PLAN_LABELS: Record<string, string> = {
  'ebook-rentable': 'Personal Trainer Rentable',
  'ebook-gluteos': 'Ebook Glúteos',
  'ebook-ryan-humiston': 'Ebook Ryan Humiston',
}

export default async function MisCursosPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('re-viva-token')?.value

  if (!token) redirect('/login?redirect=/mis-cursos')

  const payload = verificarToken(token)
  if (!payload) redirect('/login?redirect=/mis-cursos')

  const [entregas, progresos] = await Promise.all([
    prisma.ebookEntrega.findMany({ where: { userId: payload.userId, estado: 'ENTREGADO' } }),
    prisma.cursoProgreso.findMany({ where: { userId: payload.userId } }),
  ])

  const progresoMap = Object.fromEntries(progresos.map(p => [p.slug, p]))

  return (
    <div className="min-h-screen" style={{ background: '#0a0a08', color: '#f5f2e7' }}>
      {/* Header */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: 'rgba(201,168,76,0.15)' }}>
        <Link href="/dashboard">
          <span className="font-serif font-bold text-xl" style={{ color: GOLD }}>REVIVA</span>
          <span className="text-xs ml-2 tracking-widest uppercase" style={{ color: 'rgba(245,242,231,0.4)' }}>by IGZ Trainer</span>
        </Link>
        <Link href="/dashboard" className="text-sm" style={{ color: 'rgba(245,242,231,0.5)' }}>
          ← Volver al dashboard
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-serif text-3xl md:text-4xl mb-2 text-white">Mis cursos</h1>
        <p className="mb-10" style={{ color: 'rgba(245,242,231,0.6)' }}>
          Todo el contenido que compraste, disponible cuando quieras.
        </p>

        {entregas.length === 0 ? (
          <div className="rounded-2xl border p-8 text-center" style={{ borderColor: 'rgba(201,168,76,0.15)', background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-lg mb-2 text-white">Todavía no compraste ningún curso.</p>
            <p className="text-sm mb-6" style={{ color: 'rgba(245,242,231,0.5)' }}>
              Explorá los cursos y recursos disponibles para entrenadores.
            </p>
            <Link
              href="/curso-rentable"
              className="inline-block font-semibold px-6 py-3 rounded-xl text-sm"
              style={{ background: GOLD, color: '#0a0a08' }}
            >
              Ver cursos disponibles →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entregas.map(entrega => {
              const slug = entrega.planTipo.replace('ebook-', '')
              const cursoMeta = CURSOS[slug]
              const progreso = progresoMap[slug]
              const tieneReader = !!cursoMeta
              const totalCapitulos = cursoMeta?.capitulos.length ?? 0
              const completados = progreso?.completados.length ?? 0
              const porcentaje = totalCapitulos > 0 ? Math.round((completados / totalCapitulos) * 100) : 0
              const primerCapitulo = cursoMeta?.capitulos[0]?.slug
              const ultimoCapitulo = progreso?.ultimoCapitulo ?? primerCapitulo

              return (
                <div
                  key={entrega.id}
                  className="rounded-2xl border p-6"
                  style={{ borderColor: 'rgba(201,168,76,0.15)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <span
                        className="text-xs font-semibold tracking-widest uppercase px-2 py-1 rounded-md mb-3 inline-block"
                        style={{ background: 'rgba(201,168,76,0.15)', color: GOLD }}
                      >
                        {tieneReader ? 'Curso digital' : 'PDF entregado'}
                      </span>
                      <h2 className="font-serif text-xl text-white mb-1">
                        {PLAN_LABELS[entrega.planTipo] ?? entrega.planTipo}
                      </h2>

                      {tieneReader && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'rgba(245,242,231,0.5)' }}>
                            <span>{completados} de {totalCapitulos} capítulos</span>
                            <span>{porcentaje}%</span>
                          </div>
                          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ width: `${porcentaje}%`, background: GOLD }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      {tieneReader ? (
                        <Link
                          href={`/curso/${slug}/${ultimoCapitulo ?? primerCapitulo}`}
                          className="inline-block font-semibold px-5 py-2.5 rounded-xl text-sm transition-all"
                          style={{ background: GOLD, color: '#0a0a08' }}
                        >
                          {completados > 0 ? 'Continuar →' : 'Empezar →'}
                        </Link>
                      ) : (
                        <span
                          className="inline-block px-4 py-2 rounded-xl text-xs border"
                          style={{ borderColor: 'rgba(201,168,76,0.3)', color: 'rgba(245,242,231,0.5)' }}
                        >
                          Entregado por WhatsApp
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
