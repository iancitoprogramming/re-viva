'use client'

import { useRef, useCallback } from 'react'

interface MagneticElProps {
  children: React.ReactNode
  strength?: number     // 0–1, default 0.30
  className?: string
  style?: React.CSSProperties
}

/**
 * Envuelve cualquier elemento y aplica un efecto magnético sutil:
 * el contenido se desplaza levemente hacia el cursor al hacer hover.
 */
export default function MagneticEl({
  children,
  strength = 0.30,
  className = '',
  style,
}: MagneticElProps) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = ((e.clientX - rect.left) / rect.width  - 0.5) * rect.width  * strength
    const dy = ((e.clientY - rect.top)  / rect.height - 0.5) * rect.height * strength
    el.style.transition = 'transform 0.12s ease'
    el.style.transform = `translate(${dx}px, ${dy}px)`
  }, [strength])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    el.style.transform = 'translate(0, 0)'
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{ display: 'inline-block', willChange: 'transform', ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  )
}
