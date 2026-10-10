import type { CubeFace } from '../cube/cube-pose.ts'

export type Space = {
  face: CubeFace
  title: string
  description: string
  details: string[]
}

export const SPACES: Space[] = [
  {
    face: 'facade',
    title: 'La llegada',
    description:
      'Curvas de hormigón cálido, jardines que caen desde los balcones y una entrada que baja el ritmo desde el primer paso.',
    details: ['Arquitectura orgánica', 'Jardines colgantes'],
  },
  {
    face: 'lobby',
    title: 'Lobby',
    description:
      'Piedra tallada a mano, lámparas de papel y doble altura abierta al jardín. Una bienvenida pensada para quedarse.',
    details: ['Recepción 24 h', 'Check-in sin esperas'],
  },
  {
    face: 'pool',
    title: 'Piscina & bar',
    description:
      'Agua turquesa entre piedra natural, reposeras de teca y un bar al aire libre para recibir el atardecer.',
    details: ['Abierta todo el año', 'Coctelería de autor'],
  },
  {
    face: 'restaurant',
    title: 'Restaurante',
    description:
      'Cocina de estación bajo una pérgola de madera y enredaderas. Desayunos largos, cenas sin apuro.',
    details: ['Producto local', 'Desayuno incluido'],
  },
  {
    face: 'spa',
    title: 'Spa',
    description:
      'Una piscina templada bajo arcos de piedra y luz cenital, con sauna, camillas de lino y el tiempo en pausa.',
    details: ['Piscina climatizada', 'Sauna', 'Masajes'],
  },
  {
    face: 'bedroom',
    title: 'Habitaciones',
    description:
      'Lino natural, maderas claras y luz que entra sin pedir permiso. Cada habitación mira al verde.',
    details: ['Vista al jardín', 'Balcón privado', 'Blancos de lino'],
  },
]
