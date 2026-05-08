import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { verificarToken } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getCursoMeta, getCapituloContent } from '@/lib/cursos'
import CursoLayout from '@/components/curso/CursoLayout'

export default async function CapituloPage({
  params,
}: {
  params: Promise<{ slug: string; capitulo: string }>
}) {
  const { slug, capitulo } = await params

  const curso = getCursoMeta(slug)
  if (!curso) notFound()

  const capituloMeta = curso.capitulos.find(c => c.slug === capitulo)
  if (!capituloMeta) notFound()

  const cookieStore = await cookies()
  const token = cookieStore.get('re-viva-token')?.value
  if (!token) redirect(`/login?redirect=/curso/${slug}/${capitulo}`)

  const payload = verificarToken(token)
  if (!payload) redirect(`/login?redirect=/curso/${slug}/${capitulo}`)

  // Check access
  const entrega = await prisma.ebookEntrega.findFirst({
    where: { userId: payload.userId, planTipo: curso.planTipo, estado: 'ENTREGADO' },
  })
  if (!entrega) redirect('/mis-cursos')

  // Load content
  const content = await getCapituloContent(slug, capitulo)
  if (!content) notFound()

  // Load progress
  const progreso = await prisma.cursoProgreso.findUnique({
    where: { userId_slug: { userId: payload.userId, slug } },
  })

  return (
    <CursoLayout
      cursoSlug={slug}
      cursoTitulo={curso.titulo}
      capitulos={curso.capitulos}
      currentCapitulo={capitulo}
      htmlContent={content.html}
      completados={progreso?.completados ?? []}
    />
  )
}
