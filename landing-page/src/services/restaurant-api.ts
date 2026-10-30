import { API_URL } from './api.ts'

export interface PublicRestaurantPhoto {
  id: string
  url: string
}

export interface PublicRestaurantShift {
  opensAt: string
  closesAt: string
}

export interface PublicRestaurant {
  available: boolean
  description: string | null
  availableWeekdays: number[]
  shifts: PublicRestaurantShift[]
  menu: unknown[]
  photos: PublicRestaurantPhoto[]
}

// Photo urls are relative to the backend; they are immutable, so no cache busting.
export const getRestaurantPhotoUrl = (photo: PublicRestaurantPhoto) => `${API_URL}${photo.url}`

export async function getPublicRestaurant(signal?: AbortSignal): Promise<PublicRestaurant | null> {
  try {
    const response = await fetch(`${API_URL}/public/restaurant`, { cache: 'no-store', credentials: 'omit', signal })
    if (!response.ok) {
      console.error(`Restaurante: /public/restaurant respondió ${response.status}`)
      return null
    }
    const body = (await response.json()) as PublicRestaurant | null
    if (!body || typeof body !== 'object') return null
    return { ...body, photos: Array.isArray(body.photos) ? body.photos : [] }
  } catch (error) {
    if (!signal?.aborted) console.error('Restaurante: falló /public/restaurant', error)
    return null
  }
}
