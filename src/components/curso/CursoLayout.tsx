'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CapituloMeta {
  slug: string
  titulo: string
  orden: number
}

interface CursoLayoutProps {
  cursoSlug: string
  cursoTitulo: string
  capitulos: CapituloMeta[]
  currentCapitulo: string
  htmlContent: string
  completados: string[]
}

const GOLD = '#C9A84C'

export default function CursoLayout({
  cursoSlug,
  cursoTitulo,
  capitulos,
  currentCapitulo,
  htmlContent,
  completados: initialCompletados,
}: CursoLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [completados, setCompletados] = useState<string[]>(initialCompletados)

  const currentIndex = capitulos.findIndex(c => c.slug === currentCapitulo)
  const prevCapitulo = currentIndex > 0 ? capitulos[currentIndex - 1] : null
  const nextCapitulo = currentIndex < capitulos.length - 1 ? capitulos[currentIndex + 1] : null

  useEffect(() => {
    fetch('/api/curso/progreso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: cursoSlug, capitulo: currentCapitulo }),
    }).catch(() => {})
    setCompletados(prev => [...new Set([...prev, currentCapitulo])])
  }, [cursoSlug, currentCapitulo])

  // Close sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [currentCapitulo])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a08', color: '#f5f2e7' }}>
      {/* Top bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b"
        style={{ background: 'rgba(10,10,8,0.95)', borderColor: 'rgba(201,168,76,0.15)', backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="flex-shrink-0 p-2 rounded-lg transition-colors lg:hidden"
            style={{ background: sidebarOpen ? 'rgba(201,168,76,0.12)' : 'transparent' }}
            aria-label="Menú de capítulos"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <line x1="2" y1="4.5" x2="16" y2="4.5" />
              <line x1="2" y1="9" x2="16" y2="9" />
              <line x1="2" y1="13.5" x2="16" y2="13.5" />
            </svg>
          </button>
          <Link href="/mis-cursos" className="flex items-center gap-2 min-w-0">
            <span className="font-serif font-bold text-base flex-shrink-0" style={{ color: GOLD }}>REVIVA</span>
            <span className="hidden sm:block text-sm truncate" style={{ color: 'rgba(245,242,231,0.4)' }}>
              / {cursoTitulo}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(245,242,231,0.5)' }}>
          <span className="hidden sm:block">
            {completados.length}/{capitulos.length} capítulos
          </span>
          <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.round((completados.length / capitulos.length) * 100)}%`,
                background: GOLD,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className="fixed top-[53px] left-0 bottom-0 z-20 w-72 border-r overflow-y-auto transition-transform duration-200 lg:sticky lg:top-0 lg:translate-x-0 lg:h-[calc(100vh-53px)]"
          style={{
            background: '#0d0d0a',
            borderColor: 'rgba(201,168,76,0.12)',
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          <div className="p-4">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4 px-1" style={{ color: 'rgba(245,242,231,0.4)' }}>
              Contenido
            </p>
            <nav>
              {capitulos.map(cap => {
                const isActive = cap.slug === currentCapitulo
                const isDone = completados.includes(cap.slug)

                return (
                  <Link
                    key={cap.slug}
                    href={`/curso/${cursoSlug}/${cap.slug}`}
                    className="flex items-start gap-3 px-3 py-3 rounded-xl mb-1 transition-all text-sm leading-snug"
                    style={{
                      background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
                      color: isActive ? '#f5f2e7' : 'rgba(245,242,231,0.55)',
                      borderLeft: isActive ? `2px solid ${GOLD}` : '2px solid transparent',
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-xs mt-0.5"
                      style={{
                        borderColor: isDone ? GOLD : 'rgba(255,255,255,0.2)',
                        background: isDone ? 'rgba(201,168,76,0.15)' : 'transparent',
                        color: isDone ? GOLD : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {isDone ? '✓' : cap.orden}
                    </span>
                    <span>{cap.titulo}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 px-4 py-8 lg:px-0 lg:py-12">
          <div className="max-w-2xl mx-auto lg:px-8">
            <style>{`
              .md-content { line-height: 1.75; }
              .md-content h1 { font-family: Georgia, serif; font-size: 1.875rem; font-weight: 700; color: #f5f2e7; margin: 0 0 1.5rem; line-height: 1.2; }
              .md-content h2 { font-family: Georgia, serif; font-size: 1.35rem; font-weight: 700; color: #f5f2e7; margin: 2.5rem 0 1rem; }
              .md-content h3 { font-size: 1.05rem; font-weight: 600; color: #e8e4d5; margin: 2rem 0 0.75rem; }
              .md-content p { color: rgba(245,242,231,0.82); margin: 0 0 1.25rem; }
              .md-content strong { color: #f5f2e7; font-weight: 600; }
              .md-content em { color: rgba(245,242,231,0.7); }
              .md-content ul, .md-content ol { color: rgba(245,242,231,0.82); margin: 0 0 1.25rem 1.25rem; }
              .md-content li { margin-bottom: 0.4rem; }
              .md-content blockquote { border-left: 3px solid ${GOLD}; padding: 0.75rem 1.25rem; margin: 1.5rem 0; background: rgba(201,168,76,0.06); border-radius: 0 0.5rem 0.5rem 0; }
              .md-content blockquote p { color: rgba(245,242,231,0.85); margin: 0; font-style: italic; }
              .md-content a { color: ${GOLD}; text-decoration: underline; }
              .md-content hr { border: none; border-top: 1px solid rgba(201,168,76,0.2); margin: 2.5rem 0; }
              .md-content code { background: rgba(255,255,255,0.07); padding: 0.15em 0.4em; border-radius: 0.3rem; font-size: 0.875em; color: #e8e4d5; }
              .md-content pre { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1.25rem; overflow-x: auto; margin: 0 0 1.25rem; }
              .md-content pre code { background: none; padding: 0; }
              .md-content table { width: 100%; border-collapse: collapse; margin: 0 0 1.5rem; font-size: 0.9rem; }
              .md-content th { border-bottom: 1px solid rgba(201,168,76,0.3); padding: 0.6rem 0.75rem; text-align: left; color: ${GOLD}; font-weight: 600; }
              .md-content td { border-bottom: 1px solid rgba(255,255,255,0.06); padding: 0.6rem 0.75rem; color: rgba(245,242,231,0.75); }
              .md-content input[type="checkbox"] { accent-color: ${GOLD}; margin-right: 0.5rem; }
            `}</style>

            <div
              className="md-content"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t" style={{ borderColor: 'rgba(201,168,76,0.12)' }}>
              <div>
                {prevCapitulo ? (
                  <Link
                    href={`/curso/${cursoSlug}/${prevCapitulo.slug}`}
                    className="flex items-center gap-2 text-sm transition-colors"
                    style={{ color: 'rgba(245,242,231,0.5)' }}
                  >
                    <span>←</span>
                    <span className="hidden sm:block">{prevCapitulo.titulo}</span>
                    <span className="sm:hidden">Anterior</span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>

              <div>
                {nextCapitulo ? (
                  <Link
                    href={`/curso/${cursoSlug}/${nextCapitulo.slug}`}
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                    style={{ background: GOLD, color: '#0a0a08' }}
                  >
                    <span className="hidden sm:block">{nextCapitulo.titulo}</span>
                    <span className="sm:hidden">Siguiente</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <Link
                    href="/mis-cursos"
                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                    style={{ background: 'rgba(201,168,76,0.15)', color: GOLD }}
                  >
                    Curso completado ✓
                  </Link>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
