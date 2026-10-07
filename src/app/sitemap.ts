import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// Solo rutas públicas. /ads queda fuera a propósito (tráfico pago, noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/curso-rentable`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
