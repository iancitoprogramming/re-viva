import PlanesTabs from '@/components/PlanesTabs'

export default function Planes() {
  return (
    <section className="px-6 py-20 bg-ivory" id="planes">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-ink mb-3">Elegí tu punto de partida.</h2>
          <p className="text-ink-secondary text-base max-w-sm mx-auto">Cada plan es un proceso. No una clase suelta.</p>
        </div>
        <PlanesTabs />
      </div>
    </section>
  )
}
