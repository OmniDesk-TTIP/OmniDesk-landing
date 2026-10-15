import { API_URL } from './api.ts'

export const REVIEWS_PAGE_SIZE = 6

export type Review = {
  id: string
  authorName: string
  overallRating: number
  comment: string | null
  stayMonth: string
  publishedAt: string
}

export type ReviewsPage = {
  items: Review[]
  total: number
  page: number
  pageSize: number
}

export type ReviewsSummary = {
  averageRating: number | null
  ratingsCount: number
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { credentials: 'omit', signal })
    if (!response.ok) {
      console.error(`Reseñas: ${path} respondió ${response.status}`)
      return null
    }
    return (await response.json()) as T
  } catch (error) {
    if (!signal?.aborted) console.error(`Reseñas: falló ${path}`, error)
    return null
  }
}

export const fetchReviews = (page: number, signal?: AbortSignal) =>
  getJson<ReviewsPage>(`/public/reviews?page=${page}&pageSize=${REVIEWS_PAGE_SIZE}`, signal)

export const fetchReviewsSummary = (signal?: AbortSignal) =>
  getJson<ReviewsSummary>('/public/reviews/summary', signal)
