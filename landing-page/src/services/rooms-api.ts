import { API_URL } from './api.ts'

export interface PublicRoom {
  id: string
  name: string
  capacity: number
  pricePerNight: number
}

export async function getPublicRooms(signal?: AbortSignal): Promise<PublicRoom[] | null> {
  try {
    const response = await fetch(`${API_URL}/public/rooms`, { cache: 'no-store', credentials: 'omit', signal })
    if (!response.ok) {
      console.error(`Habitaciones: /public/rooms respondió ${response.status}`)
      return null
    }
    const body: unknown = await response.json()
    return Array.isArray(body) ? (body as PublicRoom[]) : null
  } catch (error) {
    if (!signal?.aborted) console.error('Habitaciones: falló /public/rooms', error)
    return null
  }
}
