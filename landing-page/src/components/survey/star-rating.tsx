import { useId, useState } from 'react'
import './star-rating.css'

const STARS = [1, 2, 3, 4, 5]

type StarRatingProps = {
  name: string
  legend: string
  value: number | undefined
  onChange: (value: number) => void
  error?: string
  size?: 'regular' | 'large'
}

function StarRating({ name, legend, value, onChange, error, size = 'regular' }: StarRatingProps) {
  const errorId = useId()
  const [preview, setPreview] = useState<number>()
  const shown = preview ?? value ?? 0

  return (
    <fieldset
      className={`star-rating star-rating--${size}`}
      aria-describedby={error ? errorId : undefined}
    >
      <legend className="star-rating__legend">{legend}</legend>
      <div className="star-rating__stars" onPointerLeave={() => setPreview(undefined)}>
        {STARS.map((star) => (
          <label
            key={star}
            className="star-rating__option"
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setPreview(star)
            }}
          >
            <input
              className="star-rating__input"
              type="radio"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
              aria-label={`${star} de ${STARS.length}`}
            />
            <svg
              className={`star-rating__star${star <= shown ? ' star-rating__star--filled' : ''}`}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2.75l2.85 5.78 6.38.93-4.62 4.5 1.09 6.35L12 17.31l-5.7 3 1.09-6.35-4.62-4.5 6.38-.93z" />
            </svg>
          </label>
        ))}
      </div>
      {error && (
        <p id={errorId} className="star-rating__error">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default StarRating
