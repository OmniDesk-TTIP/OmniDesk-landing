export const CUBE_FACES = ['lobby', 'bedroom', 'restaurant', 'pool', 'facade', 'spa'] as const

export type CubeFace = (typeof CUBE_FACES)[number]

export type CubePose = {
  x: number
  y: number
  scale: number
  focus: number
  face: CubeFace
}

export const createCubePose = (): CubePose => ({
  x: 0,
  y: 0,
  scale: 1,
  focus: 0,
  face: 'facade',
})
