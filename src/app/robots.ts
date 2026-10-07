import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// /ads NO se bloquea acá a propósito: usa meta noindex (ads/page.tsx).
// Si robots.txt bloqueara el crawleo, Google nunca vería el noindex y
// podría indexar la URL igual si alguien la linkea (ej. plataformas de ads).
//
// El resto del disallow es la app: nada de eso tiene sentido en el índice y
// varias rutas son privadas (back office, dashboard, onboarding).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin',
        '/dashboard',
        '/onboarding',
        '/pendiente',
        '/login',
        '/recuperar',
        '/checkout',
        '/curso/',   // con barra: /curso-rentable es pública y debe indexarse
        '/mis-cursos',
        '/leaderboard',
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
