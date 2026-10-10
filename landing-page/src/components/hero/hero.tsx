import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Cube from '../cube/cube.tsx'
import './hero.css'

function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const introRef = useRef<gsap.core.Timeline>(null)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.set('.hero__glow', { opacity: 0, scale: 0.4 })
      gsap.set('.hero__reveal', { opacity: 0, y: 32 })

      const breathing = gsap.to('.hero__glow', {
        paused: true,
        scale: 1.08,
        opacity: 0.85,
        duration: 5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        immediateRender: false,
      })

      introRef.current = gsap
        .timeline({ paused: true, defaults: { ease: 'power3.out' } })
        .to('.hero__glow', { opacity: 1, scale: 1, duration: prefersReducedMotion ? 0 : 3.5 }, 0.4)
        .to(
          '.hero__reveal',
          { opacity: 1, y: 0, duration: prefersReducedMotion ? 0 : 1.6, stagger: 0.18 },
          1.4,
        )
        .add(() => {
          if (!prefersReducedMotion) breathing.play()
        })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="hero">
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__content">
        <p className="hero__eyebrow hero__reveal">OmniDesk</p>
        <h1 className="hero__title">
          <span className="hero__line hero__reveal">El arte</span>
          <span className="hero__gap" aria-hidden="true" />
          <span className="hero__line hero__reveal">
            de <em>recibir</em>
          </span>
        </h1>
        <p className="hero__subtitle hero__reveal">Hospitalidad pensada en cada detalle</p>
      </div>

      <div className="hero__cube">
        <Cube onIntroStart={() => introRef.current?.play()} />
      </div>

      <div className="hero__grain" aria-hidden="true" />
    </section>
  )
}

export default Hero
