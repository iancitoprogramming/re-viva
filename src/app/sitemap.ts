import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.revivabyigz.com'

// /ads queda fuera a propósito (landing para tráfico pago, noindex).
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
      url: `${SITE_URL}/suplementos`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/terminos`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
