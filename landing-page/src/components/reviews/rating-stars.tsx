import './rating-stars.css'

const STARS = [1, 2, 3, 4, 5]
const STAR_PATH =
  'M12 2.75l2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.31l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93z'

type RatingStarsProps = {
  value: number
  label: string
  size?: 'regular' | 'large'
}

function RatingStars({ value, label, size = 'regular' }: RatingStarsProps) {
  const rounded = Math.round(value * 2) / 2

  return (
    <span className={`rating-stars rating-stars--${size}`} role="img" aria-label={label}>
      {STARS.map((star) => {
        const fill = Math.min(Math.max(rounded - star + 1, 0), 1)
        return (
          <span key={star} className="rating-stars__star" aria-hidden="true">
            <svg className="rating-stars__icon" viewBox="0 0 24 24">
              <path d={STAR_PATH} />
            </svg>
            {fill > 0 && (
              <span className="rating-stars__fill" style={{ width: `${fill * 100}%` }}>
                <svg className="rating-stars__icon rating-stars__icon--filled" viewBox="0 0 24 24">
                  <path d={STAR_PATH} />
                </svg>
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

export default RatingStars
