import { useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Cube from '../cube/cube.tsx'
import { CUBE_COVER_MARGIN, createCubePose } from '../cube/cube-pose.ts'
import Hero from '../hero/hero.tsx'
import Spaces from '../spaces/spaces.tsx'
import { SPACES } from '../spaces/spaces-data.ts'
import Rooms from '../rooms/rooms.tsx'
import { ROOMS } from '../rooms/rooms-data.ts'
import './landing.css'

gsap.registerPlugin(ScrollTrigger)

const ROOMS_CROSSFADE = 0.6
const ROOMS_HOLD = 0.4
const ROOMS_MEDIA_WIDTH = 1.2
const ROOMS_CUBE_FACE = 'bedroom'

const getRoomZoomToMatchCube = (width: number, height: number) => {
  const imageAspect = ROOMS[0].image.aspect
  const shownByGallery = width / Math.max(width * ROOMS_MEDIA_WIDTH, height * imageAspect)
  const shownByCube = Math.min(width / height, 1) / imageAspect / CUBE_COVER_MARGIN
  return shownByGallery / shownByCube
}

function Landing() {
  const rootRef = useRef<HTMLDivElement>(null)
  const introRef = useRef<gsap.core.Timeline>(null)
  const activeRoomRef = useRef(0)
  const [pose] = useState(createCubePose)
  const [activeSpace, setActiveSpace] = useState(-1)
  const [activeRoom, setActiveRoom] = useState(0)

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

      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.rooms',
            start: 'top bottom',
            end: 'top top',
            scrub: 1,
            onUpdate: () => (pose.face = ROOMS_CUBE_FACE),
            onLeave: () => (pose.face = ROOMS_CUBE_FACE),
          },
        })
        .to(pose, { x: 0, y: 0, expand: 1 }, 0)
        .to('.landing__layer--back', { autoAlpha: 0 }, 0)

      const steps = ROOMS.length - 1
      const gallery = document.querySelector<HTMLElement>('.rooms__gallery')!
      const track = document.querySelector<HTMLElement>('.rooms__track')!
      const roomMedia = gsap.utils.toArray<HTMLElement>('.rooms__media')
      const setMediaOffset = roomMedia.map((media) => gsap.quickSetter(media, 'xPercent'))
      const setProgress = gsap.quickSetter('.rooms__progress-bar', 'scaleX')
      const roomsDuration = ROOMS_CROSSFADE + ROOMS_HOLD + steps * (1 + ROOMS_HOLD)

      const roomsTimeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: '.rooms',
          start: 'top top',
          end: () => `+=${roomsDuration * window.innerHeight}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const position = -Number(gsap.getProperty(track, 'x')) / gallery.offsetWidth
          setMediaOffset.forEach((setOffset, index) =>
            setOffset(gsap.utils.clamp(-1, 1, index - position) * 8),
          )
          setProgress(steps ? position / steps : 1)

          const index = Math.round(position)
          if (index === activeRoomRef.current) return
          activeRoomRef.current = index
          setActiveRoom(index)
        },
      })

      const firstSlide = '.rooms__slide:first-child'
      roomsTimeline
        .fromTo('.rooms__gallery', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 })
        .set('.landing__layer--front', { autoAlpha: 0 })
        .fromTo(
          `${firstSlide} .rooms__media`,
          { scale: () => getRoomZoomToMatchCube(gallery.offsetWidth, gallery.offsetHeight) },
          { scale: 1, duration: ROOMS_CROSSFADE, ease: 'power2.inOut' },
          0,
        )
        .fromTo(
          [`${firstSlide} .rooms__shade`, `${firstSlide} .rooms__info`, '.rooms__hud', '.rooms__progress'],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.25 },
          ROOMS_CROSSFADE - 0.25,
        )
        .to({}, { duration: ROOMS_HOLD })

      for (let step = 1; step <= steps; step++) {
        roomsTimeline
          .to(track, { x: () => -step * gallery.offsetWidth, duration: 1, ease: 'power2.inOut' })
          .to({}, { duration: ROOMS_HOLD })
      }
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
        <Rooms activeIndex={activeRoom} />
      </main>

      <div className="landing__grain" aria-hidden="true" />
    </div>
  )
}

export default Landing
