import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /entrenadores era la URL del curso en la versión landing-only (re-viva-site),
  // indexada en el sitemap viejo. En la versión unificada el curso vive en
  // /curso-rentable — redirect permanente para no perder tráfico ni SEO.
  async redirects() {
    return [
      { source: '/entrenadores', destination: '/curso-rentable', permanent: true },
    ]
  },
};

export default nextConfig;
