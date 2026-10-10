import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Cube from '../cube/cube.tsx'
import { createCubePose } from '../cube/cube-pose.ts'
import Hero from '../hero/hero.tsx'
import Spaces from '../spaces/spaces.tsx'
import { SPACES } from '../spaces/spaces-data.ts'
import './landing.css'

gsap.registerPlugin(ScrollTrigger)

function Landing() {
  const rootRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<gsap.core.Timeline>(null)
  const [pose] = useState(createCubePose)
  const [activeSpace, setActiveSpace] = useState(-1)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.set('.landing__glow', { opacity: 0, scale: 0.4 })
      gsap.set('.hero__reveal', { opacity: 0, y: 32 })

      const breathing = gsap.to('.landing__glow', {
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
        .to('.landing__glow', { opacity: 1, scale: 1, duration: prefersReducedMotion ? 0 : 3.5 }, 0.4)
        .to(
          '.hero__reveal',
          { opacity: 1, y: 0, duration: prefersReducedMotion ? 0 : 1.6, stagger: 0.18 },
          1.4,
        )
        .add(() => {
          if (!prefersReducedMotion) breathing.play()
        })
    }, rootRef)

    const mm = gsap.matchMedia(rootRef)
    mm.add({ isDesktop: '(min-width: 768px)', isMobile: '(max-width: 767px)' }, (context) => {
      const { isDesktop } = context.conditions as { isDesktop: boolean }

      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: '.spaces', start: 'top bottom', end: 'top top', scrub: 1 },
        })
        .to(pose, isDesktop ? { x: 0.24, scale: 0.95, focus: 1 } : { y: 0.26, scale: 0.8, focus: 1 }, 0)
        .to('.landing__glow-track', isDesktop ? { x: '24vw' } : { y: '-26vh' }, 0)
        .to('.hero__content', { opacity: 0 }, 0)

      const activationLine = isDesktop ? '60%' : '80%'
      gsap.utils.toArray<HTMLElement>('.spaces__item').forEach((item, index) => {
        ScrollTrigger.create({
          trigger: item,
          start: `top ${activationLine}`,
          end: `bottom ${activationLine}`,
          onToggle: (self) => {
            if (!self.isActive) return
            setActiveSpace(index)
            pose.face = SPACES[index].face
          },
          onLeaveBack: index === 0 ? () => setActiveSpace(-1) : undefined,
        })
      })
    })

    void document.fonts.ready.then(() => ScrollTrigger.refresh())

    return () => {
      mm.revert()
      ctx.revert()
    }
  }, [pose])

  return (
    <div ref={rootRef} className="landing">
      <div className="landing__layer landing__layer--back" aria-hidden="true">
        <div className="landing__glow-track">
          <div className="landing__glow" />
        </div>
      </div>

      <div className="landing__layer landing__layer--front">
        <Cube pose={pose} onIntroStart={() => introRef.current?.play()} />
      </div>

      <main className="landing__content">
        <Hero />
        <Spaces activeIndex={activeSpace} />
      </main>

      <div className="landing__grain" aria-hidden="true" />
    </div>
  )
}

export default Landing
