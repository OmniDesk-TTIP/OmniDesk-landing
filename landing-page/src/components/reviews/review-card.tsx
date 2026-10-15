import { useId, useLayoutEffect, useRef, useState } from 'react'
import RatingStars from './rating-stars.tsx'
import type { Review } from '../../services/reviews-api.ts'
import './review-card.css'

const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

const formatStayMonth = (stayMonth: string) => {
  const [year, month] = stayMonth.split('-')
  const name = MONTHS[Number(month) - 1]
  return name ? `${name} ${year}` : stayMonth
}

type ReviewCardProps = {
  review: Review
}

function ReviewCard({ review }: ReviewCardProps) {
  const commentId = useId()
  const commentRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [clamped, setClamped] = useState(false)

  useLayoutEffect(() => {
    const comment = commentRef.current
    if (!comment || expanded) return

    const measure = () => setClamped(comment.scrollHeight > comment.clientHeight + 1)
    measure()
    void document.fonts.ready.then(measure)

    const observer = new ResizeObserver(measure)
    observer.observe(comment)
    return () => observer.disconnect()
  }, [expanded, review.comment])

  return (
    <article className="review-card" tabIndex={-1}>
      <RatingStars value={review.overallRating} label={`${review.overallRating} de 5`} />

      {review.comment && (
        <div className="review-card__body">
          <p
            ref={commentRef}
            id={commentId}
            className={`review-card__comment${expanded ? '' : ' review-card__comment--clamped'}`}
          >
            “{review.comment}”
          </p>
          {(clamped || expanded) && (
            <button
              className="review-card__toggle"
              type="button"
              aria-expanded={expanded}
              aria-controls={commentId}
              onClick={() => setExpanded((current) => !current)}
            >
              {expanded ? 'Leer menos' : 'Leer más'}
            </button>
          )}
        </div>
      )}

      <footer className="review-card__footer">
        <p className="review-card__author">{review.authorName}</p>
        <p className="review-card__stay">Se hospedó en {formatStayMonth(review.stayMonth)}</p>
      </footer>
    </article>
  )
}

export default ReviewCard
