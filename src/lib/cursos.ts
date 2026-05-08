import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

export interface CapituloMeta {
  slug: string
  titulo: string
  descripcion?: string
  orden: number
}

export interface CursoMeta {
  slug: string
  titulo: string
  planTipo: string
  capitulos: CapituloMeta[]
}

export const CURSOS: Record<string, CursoMeta> = {
  rentable: {
    slug: 'rentable',
    titulo: 'Personal Trainer Rentable',
    planTipo: 'ebook-rentable',
    capitulos: [
      { slug: '01-posicionamiento', titulo: 'Tu posicionamiento', descripcion: 'Cómo dejar de ser uno más en el rubro', orden: 1 },
      { slug: '02-precio-valor', titulo: 'Precio y valor', descripcion: 'Cuánto cobrar y cómo manejar objeciones', orden: 2 },
      { slug: '03-conversion', titulo: 'Conversión', descripcion: 'Cómo presentar tu propuesta sin que parezca venta', orden: 3 },
      { slug: '04-retencion', titulo: 'Retención', descripcion: 'Por qué se van los clientes y cómo evitarlo', orden: 4 },
      { slug: '05-modelo-ingresos', titulo: 'Modelo de ingresos', descripcion: 'Mix presencial, online y digital', orden: 5 },
      { slug: 'bonus', titulo: 'Bonus — Plantillas y herramientas', descripcion: 'Plantillas listas para usar + calculadora + benchmarks', orden: 6 },
    ],
  },
}

export function getCursoMeta(slug: string): CursoMeta | null {
  return CURSOS[slug] ?? null
}

export function getPlanTipoFromSlug(slug: string): string {
  return `ebook-${slug}`
}

marked.setOptions({ gfm: true, breaks: false })

export async function getCapituloContent(
  cursoSlug: string,
  capituloSlug: string
): Promise<{ html: string; frontmatter: Record<string, string> } | null> {
  try {
    const filePath = path.join(process.cwd(), 'content', 'cursos', cursoSlug, `${capituloSlug}.md`)
    const raw = fs.readFileSync(filePath, 'utf-8')
    const { content, data } = matter(raw)
    const html = await marked(content)
    return { html, frontmatter: data as Record<string, string> }
  } catch {
    return null
  }
}
