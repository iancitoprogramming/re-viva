import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'REVIVA · IGZ Trainer — Entrenamiento personalizado',
    template: '%s · REVIVA by IGZ Trainer',
  },
  description:
    'Entrenamiento privado con foco en resultados reales, constancia y salud duradera. Nutrición + entrenamiento + acompañamiento real, personalizado para vos.',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'REVIVA by IGZ Trainer',
    locale: 'es_AR',
    title: 'REVIVA · IGZ Trainer — Entrenamiento personalizado',
    description:
      'Entrenamiento privado con foco en resultados reales, constancia y salud duradera. Personalizado para vos.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'REVIVA · IGZ Trainer — Entrenamiento personalizado',
    description:
      'Entrenamiento privado con foco en resultados reales, constancia y salud duradera.',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a08',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-ivory text-ink antialiased`}>
        {children}
      </body>
    </html>
  )
}
