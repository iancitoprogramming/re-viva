'use client'

import { useEffect, useRef } from 'react'
import Lenis from '@studio-freight/lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function ScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)

    // ─── Section reveal animations ───
    const sections = document.querySelectorAll('[data-reveal]')
    sections.forEach((section) => {
      const children = section.querySelectorAll('[data-reveal-child]')
      if (children.length > 0) {
        gsap.set(children, { opacity: 0, y: 32 })
        ScrollTrigger.create({
          trigger: section,
          start: 'top 82%',
          once: true,
          onEnter: () => {
            gsap.to(children, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.12,
              ease: 'power3.out',
            })
          },
        })
      }
    })

    // ─── Gold underline reveals on section headings ───
    const headings = document.querySelectorAll('[data-gold-underline]')
    headings.forEach((heading) => {
      const underline = document.createElement('span')
      underline.className = 'gold-underline-bar'
      ;(heading as HTMLElement).style.position = 'relative'
      ;(heading as HTMLElement).style.display = 'inline-block'
      heading.appendChild(underline)

      gsap.set(underline, { scaleX: 0, transformOrigin: 'left center' })
      ScrollTrigger.create({
        trigger: heading,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(underline, {
            scaleX: 1,
            duration: 0.9,
            delay: 0.3,
            ease: 'power3.out',
          })
        },
      })
    })

    // ─── Parallax depth on Hero background ───
    const heroShader = document.querySelector('[data-parallax-hero]')
    if (heroShader) {
      gsap.to(heroShader, {
        y: 120,
        scrollTrigger: {
          trigger: heroShader,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        },
      })
    }

    // ─── Card expansion on scroll entry ───
    const cards = document.querySelectorAll('[data-card-reveal]')
    cards.forEach((card) => {
      gsap.set(card, { opacity: 0, y: 40, scale: 0.96 })
      ScrollTrigger.create({
        trigger: card,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
          })
        },
      })
    })

    return () => {
      lenis.destroy()
      ScrollTrigger.getAll().forEach(t => t.kill())
      gsap.ticker.remove(lenis.raf)
    }
  }, [])

  return <>{children}</>
}
