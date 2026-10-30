import { API_URL } from './api.ts'

export interface PublicSpaService {
  id: string
  name: string
  description: string
  durationMinutes: number
  price: number
  availableWeekdays: number[]
  opensAt: string
  closesAt: string
}

export interface PublicSpaPhoto {
  id: string
  url: string
}

export interface PublicSpa {
  services: PublicSpaService[]
  photos: PublicSpaPhoto[]
}

// Photo urls are relative to the backend; they are immutable, so no cache busting.
export const getSpaPhotoUrl = (photo: PublicSpaPhoto) => `${API_URL}${photo.url}`

export async function getPublicSpa(signal?: AbortSignal): Promise<PublicSpa | null> {
  try {
    const response = await fetch(`${API_URL}/public/spa`, { cache: 'no-store', credentials: 'omit', signal })
    if (!response.ok) {
      console.error(`Spa: /public/spa respondió ${response.status}`)
      return null
    }
    const body = (await response.json()) as Partial<PublicSpa> | null
    if (!body || typeof body !== 'object') return null
    return {
      services: Array.isArray(body.services) ? body.services : [],
      photos: Array.isArray(body.photos) ? body.photos : [],
    }
  } catch (error) {
    if (!signal?.aborted) console.error('Spa: falló /public/spa', error)
    return null
  }
}
