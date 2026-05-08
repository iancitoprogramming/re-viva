import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCursoMeta } from '@/lib/cursos'

export default async function CursoIndexPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const curso = getCursoMeta(slug)
  if (!curso) notFound()

  const cookieStore = await cookies()
  const token = cookieStore.get('re-viva-token')?.value
  if (!token) redirect(`/login?redirect=/curso/${slug}`)

  const payload = verificarToken(token)
  if (!payload) redirect(`/login?redirect=/curso/${slug}`)

  // Check access
  const entrega = await prisma.ebookEntrega.findFirst({
    where: { userId: payload.userId, planTipo: curso.planTipo, estado: 'ENTREGADO' },
  })
  if (!entrega) redirect('/mis-cursos')

  // Redirect to last chapter or first
  const progreso = await prisma.cursoProgreso.findUnique({
    where: { userId_slug: { userId: payload.userId, slug } },
  })

  const destino = progreso?.ultimoCapitulo ?? curso.capitulos[0]?.slug
  redirect(`/curso/${slug}/${destino}`)
}
