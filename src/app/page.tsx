// Landing page — REVIVA by IGZ Trainer
// Server component. Composición de secciones aisladas en /components/landing

import LandingHeader    from '@/components/landing/LandingHeader'
import LandingFooter    from '@/components/landing/LandingFooter'
import Hero             from '@/components/landing/Hero'
import QueIncluye       from '@/components/landing/QueIncluye'
import PropuestaDeValor from '@/components/landing/PropuestaDeValor'
import Planes           from '@/components/landing/Planes'
import ComoFunciona     from '@/components/landing/ComoFunciona'
import Terminos         from '@/components/landing/Terminos'
import Pagos            from '@/components/landing/Pagos'
import CTAFinal         from '@/components/landing/CTAFinal'

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <QueIncluye />
        <PropuestaDeValor />
        <Planes />
        <ComoFunciona />
        <Terminos />
        <Pagos />
        <CTAFinal />
      </main>
      <LandingFooter />
    </>
  )
}
