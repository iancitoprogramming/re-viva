// GET /api/admin/ejercicios → { videos: { [slug]: videoUrl } }
// PUT /api/admin/ejercicios → { slug, videoUrl } carga o cambia el video.
//                             videoUrl vacío lo quita.

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { adminDeRequest } from '@/lib/auth'
import { ejercicioPorSlug } from '@/lib/ejercicios/catalogo'
import { normalizarVideoUrl } from '@/lib/ejercicios/video'

export async function GET(request: Request) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const filas = await prisma.ejercicioVideo.findMany()
  return NextResponse.json({ videos: Object.fromEntries(filas.map(f => [f.slug, f.videoUrl])) })
}

export async function PUT(request: Request) {
  if (!adminDeRequest(request)) return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 })

  const { slug, videoUrl } = await request.json().catch(() => ({})) as { slug?: string; videoUrl?: string }
  if (!slug || !ejercicioPorSlug(slug)) {
    return NextResponse.json({ error: 'Ese ejercicio no está en el catálogo.' }, { status: 400 })
  }

  if (!videoUrl?.trim()) {
    await prisma.ejercicioVideo.deleteMany({ where: { slug } })
    return NextResponse.json({ ok: true, videoUrl: null })
  }

  const url = normalizarVideoUrl(videoUrl)
  if (!url) return NextResponse.json({ error: 'El link tiene que empezar con https://' }, { status: 400 })

  await prisma.ejercicioVideo.upsert({
    where:  { slug },
    create: { slug, videoUrl: url },
    update: { videoUrl: url },
  })
  return NextResponse.json({ ok: true, videoUrl: url })
}
