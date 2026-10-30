import deluxeQueen1200 from '../../assets/rooms/room-deluxe-queen-1200.webp'
import deluxeQueen2400 from '../../assets/rooms/room-deluxe-queen-2400.webp'
import { getRoomPhotoUrl, type PublicRoom } from '../../services/rooms-api.ts'

export type RoomPhoto = { id: string; src: string; alt: string }

export type Room = Omit<PublicRoom, 'photos'> & {
  description?: string
  features: string[]
  photos: RoomPhoto[]
}

type RoomContent = Pick<Room, 'description' | 'features'>

// Stands in for room types without photos and for photos that fail to load.
// Same picture as the cube's bedroom face, so the cube → gallery crossfade stays seamless.
export const ROOM_PLACEHOLDER = {
  src: deluxeQueen2400,
  srcSet: `${deluxeQueen1200} 1200w, ${deluxeQueen2400} 2400w`,
  aspect: 2816 / 1536,
}

// Texts the API doesn't provide, keyed by the normalized room type name.
const ROOM_CONTENT: Record<string, RoomContent> = {
  individual: {
    description:
      'Todo lo que necesitás para descansar de verdad: cama cómoda, blancos de lino y luz de jardín para arrancar el día.',
    features: ['Vista al jardín', 'Blancos de lino'],
  },
  doble: {
    description:
      'Cama queen, rincón de lectura y un ventanal enorme con vista a la ciudad. Ideal para una escapada en pareja.',
    features: ['Cama queen', 'Vista a la ciudad', 'Rincón de lectura'],
  },
  suite: {
    description:
      'Living propio, cama king y terraza privada para tomar algo al atardecer. Espacio de sobra para viajar en familia o darse un gusto.',
    features: ['Cama king', 'Terraza privada', 'Living'],
  },
}

const normalizeName = (name: string) =>
  name.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export const toRoom = ({ photos, ...room }: PublicRoom): Room => {
  const content = ROOM_CONTENT[normalizeName(room.name)]
  return {
    ...room,
    description: content?.description,
    features: content?.features ?? [],
    photos: photos.map((photo, index) => ({
      id: photo.id,
      src: getRoomPhotoUrl(photo),
      alt: `Habitación ${room.name}, foto ${index + 1}`,
    })),
  }
}
