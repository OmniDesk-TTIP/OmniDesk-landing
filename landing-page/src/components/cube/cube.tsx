import { useEffect, useEffectEvent, useRef } from 'react'
import * as THREE from 'three'
import gsap from 'gsap'
import { ARButton } from 'three/addons/webxr/ARButton.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import hotelFacade from '../../assets/cube-images/hotel-facade.webp'
import hotelLobbyReception from '../../assets/cube-images/hotel-lobby-reception.webp'
import hotelBedroom from '../../assets/cube-images/hotel-bedroom.webp'
import hotelRestaurant from '../../assets/cube-images/hotel-restaurant.webp'
import hotelPoolBar from '../../assets/cube-images/hotel-pool-bar.webp'
import hotelCourtyardLounge from '../../assets/cube-images/hotel-courtyard-lounge.webp'

const FACE_IMAGES = [
  hotelLobbyReception,
  hotelBedroom,
  hotelRestaurant,
  hotelPoolBar,
  hotelFacade,
  hotelCourtyardLounge,
]

type CubeFinish = 'glass' | 'metal'

const FINISHES: Record<CubeFinish, THREE.MeshPhysicalMaterialParameters> = {
  glass: {
    metalness: 0,
    roughness: 0.15,
    clearcoat: 0.4,
    clearcoatRoughness: 0,
    ior: 1.5,
    specularIntensity: 0.1,
    envMapIntensity: 0.8,
  },
  metal: {
    metalness: 0.75,
    roughness: 0.1,
    clearcoat: 0.6,
    clearcoatRoughness: 0.1,
    envMapIntensity: 0.1,
  },
}

type XRViewWithCamera = XRView & {
  camera?: Parameters<THREE.WebXRManager['getCameraTexture']>[0]
}

type CubeProps = {
  enableAR?: boolean
  finish?: CubeFinish
  className?: string
  onIntroStart?: () => void
}

function Cube({ enableAR = false, finish = 'glass', className, onIntroStart }: CubeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const notifyIntroStart = useEffectEvent(() => onIntroStart?.())

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const timer = new THREE.Timer()
    timer.connect(document)

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(70, 1, 0.01, 20)

    const defaultLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5)
    defaultLight.position.set(0.5, 1, 0.25)
    scene.add(defaultLight)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.xr.enabled = enableAR
    container.appendChild(renderer.domElement)

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    const environment = new RoomEnvironment()
    const envMap = pmremGenerator.fromScene(environment, 0.04).texture
    environment.dispose()
    pmremGenerator.dispose()

    let arButton: HTMLElement | undefined
    if (enableAR) {
      arButton = ARButton.createButton(renderer, { requiredFeatures: ['camera-access'] })
      container.appendChild(arButton)
    }

    const boxGeometry = new RoundedBoxGeometry(1, 1, 1, 6, 0.06)
    const loadingManager = new THREE.LoadingManager()
    const textureLoader = new THREE.TextureLoader(loadingManager)
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
    const faceTextures = FACE_IMAGES.map((src) => {
      const texture = textureLoader.load(src)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = maxAnisotropy
      return texture
    })
    const faceMaterials = faceTextures.map(
      (map) => new THREE.MeshPhysicalMaterial({ map, envMap, ...FINISHES[finish] }),
    )
    const cube = new THREE.Mesh(boxGeometry, faceMaterials)
    const cubeGroup = new THREE.Group()
    cubeGroup.add(cube)

    const getVisibleHeight = () =>
      2 * -cubeGroup.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))

    const getViewportCenterY = () => {
      const rect = container.getBoundingClientRect()
      if (rect.height === 0) return 0
      const containerTop = rect.top + window.scrollY
      const centerInContainer = THREE.MathUtils.clamp(window.innerHeight / 2 - containerTop, 0, rect.height)
      return (0.5 - centerInContainer / rect.height) * getVisibleHeight()
    }

    cubeGroup.position.set(0, 0, -3)
    cubeGroup.scale.setScalar(0.6)
    cubeGroup.visible = false
    scene.add(cubeGroup)

    let viewportCenterY = getViewportCenterY()
    const updateViewportCenter = () => {
      viewportCenterY = getViewportCenterY()
    }
    window.addEventListener('resize', updateViewportCenter)

    const introOffset = { y: -3.5 }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const intro = gsap.timeline({
      paused: true,
      defaults: { duration: prefersReducedMotion ? 0 : 4, ease: 'power3.out' },
    })
    intro
      .to(introOffset, { y: 0 })
      .to(cubeGroup.scale, { x: 1, y: 1, z: 1 }, 0)
      .from(cubeGroup.rotation, { y: -Math.PI }, 0)

    loadingManager.onLoad = () => {
      cubeGroup.visible = true
      intro.play()
      notifyIntroStart()
    }

    const resize = () => {
      if (renderer.xr.isPresenting) return
      const { clientWidth: width, clientHeight: height } = container
      if (width === 0 || height === 0) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      updateViewportCenter()
      cube.scale.setScalar(Math.min(1, getVisibleHeight() * camera.aspect * 0.42))
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)

    const setCameraTexture = () => {
      if (!renderer.xr.getSession()) {
        faceMaterials.forEach((material, i) => {
          if (material.map === faceTextures[i]) return
          material.map = faceTextures[i]
          material.needsUpdate = true
        })
        return
      }

      const frame = renderer.xr.getFrame()
      const referenceSpace = renderer.xr.getReferenceSpace()
      if (!frame || !referenceSpace) return

      const viewerPose = frame.getViewerPose(referenceSpace)
      if (!viewerPose) return

      const view = (viewerPose.views as XRViewWithCamera[]).find((v) => v.camera)
      if (!view?.camera) return

      const cameraTexture = renderer.xr.getCameraTexture(view.camera)
      if (!cameraTexture || faceMaterials[0].map === cameraTexture) return

      faceMaterials.forEach((material) => {
        material.map = cameraTexture
        material.needsUpdate = true
      })
    }

    const animate = () => {
      timer.update()
      const delta = timer.getDelta()

      if (enableAR) setCameraTexture()

      cube.rotation.x += delta * 0.3
      cube.rotation.y += delta * 0.3
      cubeGroup.position.y = viewportCenterY + introOffset.y

      renderer.render(scene, camera)
    }
    renderer.setAnimationLoop(animate)

    return () => {
      renderer.setAnimationLoop(null)
      intro.kill()
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateViewportCenter)
      timer.disconnect()
      void renderer.xr.getSession()?.end()
      arButton?.remove()
      boxGeometry.dispose()
      faceMaterials.forEach((material) => material.dispose())
      faceTextures.forEach((texture) => texture.dispose())
      envMap.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [enableAR, finish])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    />
  )
}

export default Cube
