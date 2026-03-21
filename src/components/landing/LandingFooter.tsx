import Link from 'next/link'
import { INSTAGRAM_URL } from '@/lib/constants'

export default function LandingFooter() {
  return (
    <footer className="px-6 py-8 bg-primary-dark">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-serif font-bold text-ivory/90 tracking-wide">REVIVA</span>
          <span className="text-ivory/40 text-xs ml-2">by IGZ Trainer</span>
        </div>
        <div className="flex gap-6">
          <Link href="#planes" className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Planes</Link>
          <Link href="#pagos"  className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Pagos</Link>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Instagram</a>
          <Link href="/contact" className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Contacto</Link>
          <Link href="/login"  className="text-xs text-ivory/40 hover:text-ivory/70 transition-colors">Ingresar</Link>
        </div>
        <p className="text-ivory/25 text-xs">© {new Date().getFullYear()} REVIVA · IGZ Trainer</p>
      </div>
    </footer>
  )
}
