import { API_URL } from './api.ts'

const INVALID_FALLBACK_MESSAGE = 'Revisá las calificaciones e intentá de nuevo.'

export const OVERALL_RATING_FIELD = 'overallRating'

export type SurveyStatus = 'OPEN' | 'ANSWERED' | 'EXPIRED'

export type SurveyAspect = {
  field: string
  label: string
}

export type SurveyData = {
  status: SurveyStatus
  guestFirstName: string
  checkIn: string | null
  checkOut: string | null
  expiresAt: string
  aspects: SurveyAspect[]
}

export type SurveyAnswers = Record<string, number | string | boolean>

export type SurveyResult =
  | { type: 'ok'; survey: SurveyData }
  | { type: 'invalid'; message: string }
  | { type: 'not-found' }
  | { type: 'answered' }
  | { type: 'expired' }
  | { type: 'unavailable' }

export const getRatingFields = (survey: SurveyData) => [
  OVERALL_RATING_FIELD,
  ...survey.aspects.map((aspect) => aspect.field),
]

const readMessage = (body: unknown) => {
  const message = (body as { message?: unknown } | null)?.message
  if (typeof message === 'string') return message
  if (Array.isArray(message) && typeof message[0] === 'string') return message[0]
  return INVALID_FALLBACK_MESSAGE
}

async function request(token: string, init: RequestInit): Promise<SurveyResult> {
  try {
    const response = await fetch(`${API_URL}/public/surveys/${token}`, {
      ...init,
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
    })
    const body: unknown = await response.json().catch(() => null)

    if (response.ok) return body ? { type: 'ok', survey: body as SurveyData } : { type: 'unavailable' }

    switch (response.status) {
      case 400:
        return { type: 'invalid', message: readMessage(body) }
      case 404:
        return { type: 'not-found' }
      case 409:
        return { type: 'answered' }
      case 410:
        return { type: 'expired' }
      default:
        return { type: 'unavailable' }
    }
  } catch {
    return { type: 'unavailable' }
  }
}

export const fetchSurvey = (token: string, signal: AbortSignal) => request(token, { signal })

export const submitSurvey = (token: string, answers: SurveyAnswers) =>
  request(token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  })
