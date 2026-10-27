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
      'Check-in en minutos y tu habitación lista para que las vacaciones empiecen apenas cruzás la puerta.',
    details: ['Check-in sin esperas', 'Jardines para recorrer'],
  },
  {
    face: 'lobby',
    title: 'Lobby',
    description:
      'Estamos a cualquier hora para lo que necesites: reservarte una mesa, recomendarte un plan o resolver un imprevisto.',
    details: ['Recepción 24 h', 'Atención personalizada'],
  },
  {
    face: 'pool',
    title: 'Piscina & bar',
    description:
      'Reposeras al sol, tragos de autor en el bar junto al agua y una piscina abierta todo el año. El plan perfecto para cualquier tarde.',
    details: ['Abierta todo el año', 'Coctelería de autor', 'Reposeras'],
  },
  {
    face: 'restaurant',
    title: 'Restaurante',
    description:
      'Desayuno incluido y una carta de estación con producto local. Comé rico sin salir a buscar dónde.',
    details: ['Desayuno incluido', 'Producto local', 'Cocina de estación'],
  },
  {
    face: 'spa',
    title: 'Spa',
    description:
      'Piscina climatizada, sauna y masajes para soltar el cansancio del viaje. Reservá tu turno y olvidate del reloj.',
    details: ['Piscina climatizada', 'Sauna', 'Masajes'],
  },
  {
    face: 'bedroom',
    title: 'Habitaciones',
    description:
      'Camas amplias con blancos de lino, balcón privado y vista al jardín. Pensadas para que duermas como en casa, o mejor.',
    details: ['Balcón privado', 'Blancos de lino', 'Vista al jardín'],
  },
]
