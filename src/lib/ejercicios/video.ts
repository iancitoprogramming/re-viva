// Videos de la biblioteca de ejercicios: validación del link y cómo se muestra.
// Se guarda solo la URL (YouTube no listado, o un archivo de video directo).

import { SITE_URL } from '@/lib/site'

export type VideoEmbed =
  | { tipo: 'youtube'; src: string }
  | { tipo: 'archivo'; src: string }
  | { tipo: 'link'; src: string }

// Devuelve la URL limpia, o null si no es un link https válido.
export function normalizarVideoUrl(valor: unknown): string | null {
  if (typeof valor !== 'string') return null
  try {
    const url = new URL(valor.trim())
    return url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

function idYoutube(url: URL): string | null {
  const host = url.hostname.replace(/^www\.|^m\./, '')
  if (host === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') return url.searchParams.get('v')
    const m = url.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/)
    return m ? m[2] : null
  }
  return null
}

export function embedDeVideo(videoUrl: string): VideoEmbed {
  const url = new URL(videoUrl)
  const id = idYoutube(url)
  if (id && /^[\w-]{6,20}$/.test(id)) {
    return { tipo: 'youtube', src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1` }
  }
  if (/\.(mp4|webm|mov|m4v)$/i.test(url.pathname)) return { tipo: 'archivo', src: videoUrl }
  return { tipo: 'link', src: videoUrl }
}

// Link que va en el documento de entrenamiento del cliente.
export const linkEjercicio = (slug: string): string => `${SITE_URL}/ejercicios/${slug}`
