import Link from 'next/link'

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-sm border-b border-edge">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          <span className="font-serif font-bold text-xl text-primary tracking-wide">REVIVA</span>
          <span className="text-ink-muted text-xs ml-2 tracking-widest uppercase">by IGZ Trainer</span>
        </div>
        <Link href="/login" className="text-sm text-ink-secondary hover:text-primary font-medium transition-colors">
          Ingresar
        </Link>
      </div>
    </header>
  )
}
