import { useEffect, useRef, useState, type ReactNode } from 'react'
import RatingStars from './rating-stars.tsx'
import ReviewCard from './review-card.tsx'
import {
  fetchReviews,
  fetchReviewsSummary,
  type ReviewsPage,
  type ReviewsSummary,
} from '../../services/reviews-api.ts'
import './reviews.css'

const SKELETON_CARDS = 3

const formatRating = new Intl.NumberFormat('es-AR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
}).format

const formatCount = new Intl.NumberFormat('es-AR').format

type ReviewsState = {
  summary: ReviewsSummary | null
  reviews: ReviewsPage | null
}

function ReviewsHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="reviews__header">
      <p className="reviews__eyebrow">Reseñas</p>
      <h2 id="reviews-title" className="reviews__title">
        Lo que dicen <em>nuestros huéspedes</em>
      </h2>
      {children}
    </header>
  )
}

function Reviews() {
  const listRef = useRef<HTMLUListElement>(null)
  const focusIndexRef = useRef<number | null>(null)
  const loadingMoreRef = useRef(false)
  const [state, setState] = useState<ReviewsState>()
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreFailed, setMoreFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    void Promise.all([
      fetchReviewsSummary(controller.signal),
      fetchReviews(1, controller.signal),
    ]).then(([summary, reviews]) => {
      if (!controller.signal.aborted) setState({ summary, reviews })
    })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const index = focusIndexRef.current
    if (index === null) return
    focusIndexRef.current = null
    listRef.current?.querySelectorAll<HTMLElement>('.review-card')[index]?.focus()
  }, [state])

  const loadMore = async () => {
    const current = state?.reviews
    if (!current || loadingMoreRef.current) return
    loadingMoreRef.current = true
    setLoadingMore(true)
    setMoreFailed(false)

    const next = await fetchReviews(current.page + 1)

    loadingMoreRef.current = false
    setLoadingMore(false)
    if (!next) {
      setMoreFailed(true)
      return
    }

    focusIndexRef.current = current.items.length
    setState((previous) => {
      if (!previous?.reviews) return previous
      const shown = new Set(previous.reviews.items.map((review) => review.id))
      const items = [...previous.reviews.items, ...next.items.filter((review) => !shown.has(review.id))]
      const total = next.items.length ? next.total : items.length
      return { ...previous, reviews: { ...next, items, total } }
    })
  }

  if (!state) {
    return (
      <section id="resenas" className="reviews" aria-labelledby="reviews-title" aria-busy="true">
        <ReviewsHeader>
          <div className="reviews__summary reviews__summary--skeleton" aria-hidden="true">
            <span className="reviews__bone reviews__bone--average" />
            <span className="reviews__bone reviews__bone--count" />
          </div>
        </ReviewsHeader>
        <ul className="reviews__list" aria-hidden="true">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <li key={index} className="reviews__item reviews__skeleton">
              <span className="reviews__bone reviews__bone--stars" />
              <span className="reviews__bone reviews__bone--line" />
              <span className="reviews__bone reviews__bone--line" />
              <span className="reviews__bone reviews__bone--line reviews__bone--short" />
              <span className="reviews__bone reviews__bone--author" />
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const { summary, reviews } = state
  const items = reviews?.items ?? []
  const average = summary?.ratingsCount ? summary.averageRating : null
  const hasMore = reviews !== null && items.length < reviews.total

  if (!items.length && average === null) return null

  return (
    <section id="resenas" className="reviews" aria-labelledby="reviews-title">
      <ReviewsHeader>
        {summary && average !== null && (
          <div className="reviews__summary">
            <p className="reviews__average" aria-hidden="true">
              {formatRating(average)}
            </p>
            <div>
              <RatingStars
                size="large"
                value={average}
                label={`Calificación promedio: ${formatRating(average)} de 5`}
              />
              <p className="reviews__count">
                Basado en {formatCount(summary.ratingsCount)}{' '}
                {summary.ratingsCount === 1 ? 'opinión' : 'opiniones'}
              </p>
            </div>
          </div>
        )}
      </ReviewsHeader>

      {items.length > 0 && (
        <ul ref={listRef} className="reviews__list">
          {items.map((review) => (
            <li key={review.id} className="reviews__item">
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="reviews__more">
          <button
            className="reviews__more-button"
            type="button"
            disabled={loadingMore}
            onClick={() => void loadMore()}
          >
            {loadingMore ? 'Cargando…' : 'Ver más reseñas'}
          </button>
          {moreFailed && (
            <p className="reviews__more-error" role="alert">
              No pudimos cargar más reseñas. Probá de nuevo.
            </p>
          )}
        </div>
      )}
    </section>
  )
}

export default Reviews
