// Catálogo de suplementos recomendados — helpers compartidos (web, admin, DOCX, mails).

import { SITE_URL } from '@/lib/constants'

export const OBJETIVOS_SUPLEMENTO = [
  { value: 'GANANCIA_MUSCULAR', label: 'Ganancia muscular', slug: 'ganancia-muscular' },
  { value: 'PERDIDA_GRASA',     label: 'Pérdida de grasa',  slug: 'perdida-de-grasa' },
  { value: 'RENDIMIENTO',       label: 'Rendimiento',       slug: 'rendimiento' },
  { value: 'SALUD_GENERAL',     label: 'Salud general',     slug: 'salud-general' },
] as const

export type ObjetivoSuplementoValue = (typeof OBJETIVOS_SUPLEMENTO)[number]['value']

export const AVISO_AFILIADOS =
  'Algunos links son de afiliado: si comprás a través de ellos, Re-Viva puede recibir una comisión sin costo extra para vos. ' +
  'Elegimos cada producto por eficiencia y precio-calidad. Ningún suplemento reemplaza una consulta médica.'

export type OrigenClick = 'catalogo' | 'documento' | 'mail'

// Link que va en los documentos y mails: registra el clic y redirige al afiliado.
export function linkAfiliadoTrackeado(slug: string, origen: OrigenClick = 'documento'): string {
  return `${SITE_URL}/suplementos/ir/${slug}?o=${origen}`
}

// Ficha del producto dentro del catálogo.
export function linkFichaCatalogo(slug: string): string {
  return `${SITE_URL}/suplementos#${slug}`
}
