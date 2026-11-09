// Catálogo de suplementos recomendados — helpers compartidos (web, admin, DOCX, mails).

import { SITE_URL } from '@/lib/site'

export const OBJETIVOS_SUPLEMENTO = [
  { value: 'ELEMENTOS_BASE',    label: 'Lo básico',         slug: 'lo-basico' },
  { value: 'GANANCIA_MUSCULAR', label: 'Ganancia muscular', slug: 'ganancia-muscular' },
  { value: 'PERDIDA_GRASA',     label: 'Pérdida de grasa',  slug: 'perdida-de-grasa' },
  { value: 'RENDIMIENTO',       label: 'Rendimiento',       slug: 'rendimiento' },
  { value: 'SALUD_GENERAL',     label: 'Salud general',     slug: 'salud-general' },
] as const

export type ObjetivoSuplementoValue = (typeof OBJETIVOS_SUPLEMENTO)[number]['value']

// Bloque de transparencia obligatorio (CLAUDE.md §14). Texto fijo, en tipografía
// normal — nunca en letra chica. Va en todo entregable que incluya productos.
export const TEXTO_TRANSPARENCIA_AFILIADOS = {
  titulo: 'Sobre los links de esta sección',
  parrafos: [
    'Los enlaces son links de afiliado: si comprás a través de ellos, recibo una comisión de la plataforma. No modifica el precio que pagás vos.',
    'Los productos están elegidos por composición, dosis por porción y relación precio-calidad al momento de armar el plan. Si conseguís el mismo producto más barato en otro lado, compralo ahí.',
    'Ningún suplemento de esta lista es imprescindible para que el plan funcione. Si querés, lo revisamos y priorizamos según tu presupuesto.',
  ],
} as const

// En el catálogo público se suma la aclaración médica.
export const AVISO_CONSULTA_MEDICA =
  'Ninguna recomendación reemplaza una consulta médica, sobre todo si tomás medicación, estás embarazada o tenés una condición de salud.'

export type OrigenClick = 'catalogo' | 'documento' | 'mail'

// Link que va en los documentos y mails: registra el clic y redirige al afiliado.
export function linkAfiliadoTrackeado(slug: string, origen: OrigenClick = 'documento'): string {
  return `${SITE_URL}/suplementos/ir/${slug}?o=${origen}`
}

// Ficha del producto dentro del catálogo.
export function linkFichaCatalogo(slug: string): string {
  return `${SITE_URL}/suplementos#${slug}`
}
