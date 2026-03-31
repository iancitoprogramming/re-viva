// Landing page — REVIVA by IGZ Trainer
// Server component. Composición de secciones aisladas en /components/landing

import LandingHeader  from '@/components/landing/LandingHeader'
import LandingFooter  from '@/components/landing/LandingFooter'
import CursorGlow     from '@/components/CursorGlow'
import Hero           from '@/components/landing/Hero'
import Problemas      from '@/components/landing/Problemas'
import QueIncluye     from '@/components/landing/QueIncluye'
import Trainer        from '@/components/landing/Trainer'
import Resultados     from '@/components/landing/Resultados'
import ComoFunciona   from '@/components/landing/ComoFunciona'
import Planes         from '@/components/landing/Planes'
import Pagos          from '@/components/landing/Pagos'
import CTAFinal       from '@/components/landing/CTAFinal'
import Terminos       from '@/components/landing/Terminos'

export default function LandingPage() {
  return (
    <>
      <CursorGlow />
      <LandingHeader />
      <main>
        {/* 1. Identidad: quién podés ser */}
        <Hero />

        {/* 2. Dolor: el lector se reconoce */}
        <Problemas />

        {/* 3. Propuesta: qué recibís */}
        <QueIncluye />

        {/* 5. Confianza: quién es Ian */}
        <Trainer />

        {/* 6. Prueba social: resultados reales */}
        <Resultados />

        {/* 7. Proceso: cómo funciona */}
        <ComoFunciona />

        {/* 8. Conversión: planes y precios */}
        <Planes />

        {/* 9. Cierre emocional */}
        <CTAFinal />

        {/* 10. Medios de pago */}
        <Pagos />

        {/* 11. Legales */}
        <Terminos />
      </main>
      <LandingFooter />
    </>
  )
}
