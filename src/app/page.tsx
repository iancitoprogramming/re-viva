// Landing page — REVIVA by IGZ Trainer
// Server component. Composición de secciones aisladas en /components/landing

import LandingHeader  from '@/components/landing/LandingHeader'
import LandingFooter  from '@/components/landing/LandingFooter'
import Hero           from '@/components/landing/Hero'
import Problemas      from '@/components/landing/Problemas'
import Transformacion from '@/components/landing/Transformacion'
import QueIncluye     from '@/components/landing/QueIncluye'
import Trainer        from '@/components/landing/Trainer'
import ComoFunciona   from '@/components/landing/ComoFunciona'
import Planes         from '@/components/landing/Planes'
import Pagos          from '@/components/landing/Pagos'
import CTAFinal       from '@/components/landing/CTAFinal'
import Terminos       from '@/components/landing/Terminos'

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        {/* 1. Identidad: quién podés ser */}
        <Hero />

        {/* 2. Dolor: el lector se reconoce */}
        <Problemas />

        {/* 3. Visión: cómo luce el cambio */}
        <Transformacion />

        {/* 4. Propuesta: qué recibís */}
        <QueIncluye />

        {/* 5. Confianza: quién es Ian */}
        <Trainer />

        {/* 6. Proceso: cómo funciona */}
        <ComoFunciona />

        {/* 7. Conversión: planes y precios */}
        <Planes />

        {/* 8. Cierre emocional */}
        <CTAFinal />

        {/* 9. Medios de pago */}
        <Pagos />

        {/* 10. Legales */}
        <Terminos />
      </main>
      <LandingFooter />
    </>
  )
}
