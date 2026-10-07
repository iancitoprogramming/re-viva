import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // El sitio del dev publicaba el curso en /entrenadores. Acá la landing
      // del curso es /curso-rentable: redirigimos para no perder esos links.
      { source: '/entrenadores', destination: '/curso-rentable', permanent: true },
    ]
  },
};

export default nextConfig;
