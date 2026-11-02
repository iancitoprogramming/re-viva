// Standalone landing page for paid ads — no navigation, no footer.
// Not linked from anywhere in the site.

import type { Metadata } from 'next'
import Hero from '@/components/landing/Hero'
import CursorGlow from '@/components/CursorGlow'

// noindex: es un duplicado del home pensado solo para trafico pago.
// Sin esto Google la indexa y compite con la home (contenido duplicado).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdsPage() {
  return (
    <>
      <CursorGlow />
      <Hero standalone />
    </>
  )
}
