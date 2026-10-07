// Landing page — REVIVA by IGZ Trainer
// Server component. Composicion de secciones aisladas en /components/landing

import type { Metadata } from 'next'
import LandingHeader  from '@/components/landing/LandingHeader'
import LandingFooter  from '@/components/landing/LandingFooter'
import CursorGlow     from '@/components/CursorGlow'
import ScrollProvider from '@/components/ScrollProvider'
import Hero           from '@/components/landing/Hero'
import Metodologia    from '@/components/landing/Metodologia'
import Problemas      from '@/components/landing/Problemas'
import QueIncluye     from '@/components/landing/QueIncluye'
import Trainer        from '@/components/landing/Trainer'
import Resultados     from '@/components/landing/Resultados'
import ComoFunciona   from '@/components/landing/ComoFunciona'
import Planes         from '@/components/landing/Planes'
import Pagos          from '@/components/landing/Pagos'
import CursoEntrenadores from '@/components/landing/CursoEntrenadores'
import CTAFinal       from '@/components/landing/CTAFinal'
import Terminos       from '@/components/landing/Terminos'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function LandingPage() {
  return (
    <>
      <CursorGlow />
      <ScrollProvider>
        <LandingHeader />
        <main>
          {/* 1. Identidad: quien podes ser */}
          <Hero />

          {/* 1.5. Credenciales metodologicas */}
          <Metodologia />

          {/* 2. Dolor: el lector se reconoce */}
          <Problemas />

          {/* 3. Propuesta: que recibis */}
          <QueIncluye />

          {/* 5. Confianza: quien es Ian */}
          <Trainer />

          {/* 6. Prueba social: resultados reales */}
          <Resultados />

          {/* 7. Proceso: como funciona */}
          <ComoFunciona />

          {/* 8. Conversion: planes y precios */}
          <Planes />

          {/* 9. Seccion para entrenadores — curso rentable */}
          <CursoEntrenadores />

          {/* 10. Cierre emocional */}
          <CTAFinal />

          {/* 10. Medios de pago */}
          <Pagos />

          {/* 11. Legales */}
          <Terminos />
        </main>
        <LandingFooter />
      </ScrollProvider>
    </>
  )
}
