// Dominio público del sitio. Se usa para canonicals, sitemap, robots y OG.
//
// Ojo: NO es lo mismo que NEXT_PUBLIC_BASE_URL. Esa apunta al deploy que
// atiende las back_urls de Mercado Pago (hoy re-viva.vercel.app); esta es la
// URL con la que el sitio quiere ser indexado.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.revivabyigz.com'
