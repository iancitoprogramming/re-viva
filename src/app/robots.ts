import type { MetadataRoute } from 'next'

// /ads NO se bloquea acá a propósito: usa meta noindex (ads/page.tsx).
// Si robots.txt bloqueara el crawleo, Google nunca vería el noindex y
// podría indexar la URL igual si alguien la linkea (ej. plataformas de ads).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://www.revivabyigz.com/sitemap.xml',
  }
}
