import PlanesTabs from '@/components/PlanesTabs'

const IVORY   = '#F5F2E7'
const IVORY60 = 'rgba(245,242,231,0.60)'

export default function Planes() {
  return (
    <section
      data-reveal
      className="px-6 py-20"
      id="planes"
      style={{
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.07) 0%, transparent 55%), #0a0a08',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div data-reveal-child className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl mb-3"
              style={{ color: IVORY }}>
            Elegí tu punto de partida.
          </h2>
          <p className="text-base max-w-sm mx-auto"
             style={{ color: IVORY60 }}>
            Cada plan es un proceso. No una clase suelta.
          </p>
        </div>
        <PlanesTabs />
      </div>
    </section>
  )
}
