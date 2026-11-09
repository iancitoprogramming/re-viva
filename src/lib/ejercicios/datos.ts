// Lectura de los videos cargados. Si la tabla todavía no existe (migración sin
// correr) la biblioteca se muestra vacía en vez de romper la página.

import { prisma } from '@/lib/prisma'

export async function videosCargados(): Promise<Record<string, string>> {
  try {
    const filas = await prisma.ejercicioVideo.findMany()
    return Object.fromEntries(filas.map(f => [f.slug, f.videoUrl]))
  } catch (error) {
    console.error('[ejercicios] No se pudieron leer los videos:', error)
    return {}
  }
}

export async function videoDeEjercicio(slug: string): Promise<string | null> {
  try {
    return (await prisma.ejercicioVideo.findUnique({ where: { slug } }))?.videoUrl ?? null
  } catch (error) {
    console.error('[ejercicios] No se pudo leer el video:', error)
    return null
  }
}
