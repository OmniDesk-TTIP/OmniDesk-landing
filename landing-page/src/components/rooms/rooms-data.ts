import deluxeQueen1200 from '../../assets/rooms/room-deluxe-queen-1200.webp'
import deluxeQueen2400 from '../../assets/rooms/room-deluxe-queen-2400.webp'
import twin1200 from '../../assets/rooms/room-twin-1200.webp'
import twin2400 from '../../assets/rooms/room-twin-2400.webp'
import terraceSuite1200 from '../../assets/rooms/room-terrace-suite-1200.webp'
import terraceSuite2400 from '../../assets/rooms/room-terrace-suite-2400.webp'

export type Room = {
  id: string
  name: string
  description: string
  image: { small: string; large: string; alt: string; aspect: number }
  specs: string[]
  pricePerNight: number
}

export const ROOMS: Room[] = [
  {
    id: 'deluxe-queen',
    name: 'Deluxe Queen',
    description:
      'Ventanal de piso a techo, lino blanco y un rincón de lectura para ver la ciudad despertar.',
    image: {
      small: deluxeQueen1200,
      aspect: 2816 / 1536,
      large: deluxeQueen2400,
      alt: 'Habitación Deluxe Queen con cama grande, sillón de lectura y ventanal con vista a la ciudad',
    },
    specs: ['32 m²', '2 huéspedes', 'Cama queen', 'Vista a la ciudad'],
    pricePerNight: 180,
  },
  {
    id: 'twin',
    name: 'Twin Jardín',
    description:
      'Dos camas individuales, maderas claras y luz de jardín. Pensada para viajar en compañía.',
    image: {
      small: twin1200,
      aspect: 2752 / 1536,
      large: twin2400,
      alt: 'Habitación Twin con dos camas individuales, plantas y ventana al jardín',
    },
    specs: ['30 m²', '2 huéspedes', '2 camas individuales', 'Vista al jardín'],
    pricePerNight: 160,
  },
  {
    id: 'terrace-suite',
    name: 'Suite Terraza',
    description:
      'Living propio, dormitorio abierto y una terraza privada entre palmeras para los atardeceres.',
    image: {
      small: terraceSuite1200,
      aspect: 2752 / 1536,
      large: terraceSuite2400,
      alt: 'Suite con living, cama king y terraza privada con palmeras',
    },
    specs: ['58 m²', 'Hasta 3 huéspedes', 'Cama king', 'Terraza privada'],
    pricePerNight: 320,
  },
]
