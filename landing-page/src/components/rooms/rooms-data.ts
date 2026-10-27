import deluxeQueen1200 from '../../assets/rooms/room-deluxe-queen-1200.webp'
import deluxeQueen2400 from '../../assets/rooms/room-deluxe-queen-2400.webp'
import twin1200 from '../../assets/rooms/room-twin-1200.webp'
import twin2400 from '../../assets/rooms/room-twin-2400.webp'
import terraceSuite1200 from '../../assets/rooms/room-terrace-suite-1200.webp'
import terraceSuite2400 from '../../assets/rooms/room-terrace-suite-2400.webp'
import type { PublicRoom } from '../../services/rooms-api.ts'

export type RoomImage = { small: string; large: string; alt: string; aspect: number }

export type Room = PublicRoom & {
  description?: string
  image: RoomImage
  features: string[]
}

type RoomContent = Pick<Room, 'description' | 'image' | 'features'>

// Same picture as the cube's bedroom face, so the cube → gallery crossfade stays seamless.
export const DEFAULT_ROOM_IMAGE: RoomImage = {
  small: deluxeQueen1200,
  large: deluxeQueen2400,
  aspect: 2816 / 1536,
  alt: 'Habitación con cama grande, sillón de lectura y ventanal con vista a la ciudad',
}

// Content the API doesn't provide, keyed by the normalized room type name.
const ROOM_CONTENT: Record<string, RoomContent> = {
  individual: {
    description:
      'Todo lo que necesitás para descansar de verdad: cama cómoda, blancos de lino y luz de jardín para arrancar el día.',
    image: {
      small: twin1200,
      large: twin2400,
      aspect: 2752 / 1536,
      alt: 'Habitación con maderas claras, plantas y ventana al jardín',
    },
    features: ['Vista al jardín', 'Blancos de lino'],
  },
  doble: {
    description:
      'Cama queen, rincón de lectura y un ventanal enorme con vista a la ciudad. Ideal para una escapada en pareja.',
    image: DEFAULT_ROOM_IMAGE,
    features: ['Cama queen', 'Vista a la ciudad', 'Rincón de lectura'],
  },
  suite: {
    description:
      'Living propio, cama king y terraza privada para tomar algo al atardecer. Espacio de sobra para viajar en familia o darse un gusto.',
    image: {
      small: terraceSuite1200,
      large: terraceSuite2400,
      aspect: 2752 / 1536,
      alt: 'Suite con living, cama king y terraza privada con palmeras',
    },
    features: ['Cama king', 'Terraza privada', 'Living'],
  },
}

const normalizeName = (name: string) =>
  name.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const toRoom = (room: PublicRoom): Room => {
  const content = ROOM_CONTENT[normalizeName(room.name)]
  return {
    ...room,
    description: content?.description,
    image: content?.image ?? { ...DEFAULT_ROOM_IMAGE, alt: `Habitación ${room.name}` },
    features: content?.features ?? [],
  }
}
