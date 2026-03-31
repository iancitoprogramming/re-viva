'use client'

import { useEffect, useRef } from 'react'

/**
 * Spotlight sutil en gold que sigue el cursor.
 * pointer-events: none — no interfiere con nada.
 * Se oculta en dispositivos táctiles.
 */
export default function CursorGlow() {
  const outerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    // Detectar touch device — no mostrar en mobile
    if (window.matchMedia('(hover: none)').matches) {
      outer.style.display = 'none'
      return
    }

    // Reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      outer.style.display = 'none'
      return
    }

    let raf: number
    let tx = -600, ty = -600      // posición target (mouse)
    let cx = -600, cy = -600      // posición actual (lerped)

    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
      // Activar al primer movimiento
      outer.style.opacity = '1'
      inner.style.opacity = '1'
    }

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const tick = () => {
      // Outer: lag más pronunciado (efecto trailing)
      cx = lerp(cx, tx, 0.10)
      cy = lerp(cy, ty, 0.10)
      outer.style.transform = `translate(${cx - 300}px, ${cy - 300}px)`

      // Inner: casi sin lag (más preciso)
      const ix = lerp(parseFloat(inner.dataset.x || String(tx)), tx, 0.20)
      const iy = lerp(parseFloat(inner.dataset.y || String(ty)), ty, 0.20)
      inner.dataset.x = String(ix)
      inner.dataset.y = String(iy)
      inner.style.transform = `translate(${ix - 100}px, ${iy - 100}px)`

      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      {/* Outer glow: gold difuso, lag suave */}
      <div
        ref={outerRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.055) 0%, rgba(201,168,76,0.015) 40%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9990,
          willChange: 'transform',
          opacity: 0,
          transition: 'opacity 0.6s ease',
        }}
      />
      {/* Inner glow: amber más concentrado, lag mínimo */}
      <div
        ref={innerRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.09) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 9991,
          willChange: 'transform',
          opacity: 0,
          transition: 'opacity 0.6s ease',
        }}
      />
    </>
  )
}
