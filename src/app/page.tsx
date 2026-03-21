// Landing page — REVIVA by IGZ Trainer
// Server component. Composición de secciones aisladas en /components/landing

import LandingHeader    from '@/components/landing/LandingHeader'
import LandingFooter    from '@/components/landing/LandingFooter'
import Hero             from '@/components/landing/Hero'
import Problemas        from '@/components/landing/Problemas'
import QueIncluye       from '@/components/landing/QueIncluye'
import ComoFunciona     from '@/components/landing/ComoFunciona'
import Planes           from '@/components/landing/Planes'
import Terminos         from '@/components/landing/Terminos'
import Pagos            from '@/components/landing/Pagos'
import CTAFinal         from '@/components/landing/CTAFinal'

export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <Problemas />
        <QueIncluye />
        <ComoFunciona />
        <Planes />
        <Terminos />
        <Pagos />
        <CTAFinal />
      </main>
      <LandingFooter />
    </>
  )
}
