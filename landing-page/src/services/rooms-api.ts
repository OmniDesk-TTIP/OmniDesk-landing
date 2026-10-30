import { API_URL } from './api.ts'

export interface PublicRoomPhoto {
  id: string
  url: string
}

export interface PublicRoom {
  id: string
  name: string
  capacity: number
  pricePerNight: number
  photos: PublicRoomPhoto[]
}

// Photo urls are relative to the backend; they are immutable, so no cache busting.
export const getRoomPhotoUrl = (photo: PublicRoomPhoto) => `${API_URL}${photo.url}`

export async function getPublicRooms(signal?: AbortSignal): Promise<PublicRoom[] | null> {
  try {
    const response = await fetch(`${API_URL}/public/rooms`, { cache: 'no-store', credentials: 'omit', signal })
    if (!response.ok) {
      console.error(`Habitaciones: /public/rooms respondió ${response.status}`)
      return null
    }
    const body: unknown = await response.json()
    if (!Array.isArray(body)) return null
    return (body as PublicRoom[]).map((room) => ({ ...room, photos: Array.isArray(room.photos) ? room.photos : [] }))
  } catch (error) {
    if (!signal?.aborted) console.error('Habitaciones: falló /public/rooms', error)
    return null
  }
}
