import { useId, useRef, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { flushSync } from 'react-dom'
import StarRating from './star-rating.tsx'
import { OVERALL_RATING_FIELD, getRatingFields, type SurveyData } from '../../services/survey-api.ts'
import './survey-button.css'
import './survey-form.css'

const COMMENT_MAX_LENGTH = 1000
const MISSING_RATING_MESSAGE = 'Elegí una calificación'

export type SurveyDraft = {
  ratings: Partial<Record<string, number>>
  comment: string
  publishConsent: boolean
}

const formatDate = (value: string) => value.split('-').reverse().join('/')

const formatStay = ({ checkIn, checkOut }: SurveyData) => {
  if (checkIn && checkOut) return `Estadía del ${formatDate(checkIn)} al ${formatDate(checkOut)}`
  if (checkIn) return `Ingreso: ${formatDate(checkIn)}`
  if (checkOut) return `Salida: ${formatDate(checkOut)}`
  return null
}

type SurveyFormProps = {
  survey: SurveyData
  draft: SurveyDraft
  onDraftChange: Dispatch<SetStateAction<SurveyDraft>>
  onSubmit: () => void
  submitting: boolean
  error: string | null
}

function SurveyForm({ survey, draft, onDraftChange, onSubmit, submitting, error }: SurveyFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const commentId = useId()
  const counterId = useId()
  const [showMissing, setShowMissing] = useState(false)
  const stay = formatStay(survey)

  const getError = (field: string) =>
    showMissing && draft.ratings[field] === undefined ? MISSING_RATING_MESSAGE : undefined

  const setRating = (field: string, value: number) =>
    onDraftChange((current) => ({ ...current, ratings: { ...current.ratings, [field]: value } }))

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    const missing = getRatingFields(survey).filter((field) => draft.ratings[field] === undefined)
    if (missing.length) {
      flushSync(() => setShowMissing(true))
      formRef.current
        ?.querySelector<HTMLInputElement>(`input[name="${CSS.escape(missing[0])}"]`)
        ?.focus()
      return
    }

    onSubmit()
  }

  return (
    <form ref={formRef} className="survey-form" onSubmit={handleSubmit} noValidate>
      <header>
        <h1 className="survey-form__title">
          ¡Hola {survey.guestFirstName}! <em>¿Cómo fue tu estadía?</em>
        </h1>
        {stay && <p className="survey-form__stay">{stay}</p>}
      </header>

      <div className="survey-form__overall">
        <StarRating
          size="large"
          name={OVERALL_RATING_FIELD}
          legend="Calificación general"
          value={draft.ratings[OVERALL_RATING_FIELD]}
          onChange={(value) => setRating(OVERALL_RATING_FIELD, value)}
          error={getError(OVERALL_RATING_FIELD)}
        />
      </div>

      {survey.aspects.length > 0 && (
        <div className="survey-form__aspects">
          {survey.aspects.map((aspect) => (
            <StarRating
              key={aspect.field}
              name={aspect.field}
              legend={aspect.label}
              value={draft.ratings[aspect.field]}
              onChange={(value) => setRating(aspect.field, value)}
              error={getError(aspect.field)}
            />
          ))}
        </div>
      )}

      <div>
        <label className="survey-form__label" htmlFor={commentId}>
          Comentario <span className="survey-form__optional">(opcional)</span>
        </label>
        <textarea
          id={commentId}
          className="survey-form__textarea"
          rows={5}
          maxLength={COMMENT_MAX_LENGTH}
          value={draft.comment}
          onChange={(event) => onDraftChange((current) => ({ ...current, comment: event.target.value }))}
          aria-describedby={counterId}
        />
        <p id={counterId} className="survey-form__counter">
          {draft.comment.length}/{COMMENT_MAX_LENGTH}
        </p>
      </div>

      <label className="survey-form__consent">
        <input
          className="survey-form__checkbox"
          type="checkbox"
          checked={draft.publishConsent}
          onChange={(event) =>
            onDraftChange((current) => ({ ...current, publishConsent: event.target.checked }))
          }
        />
        <span>
          Autorizo que mi comentario y mi calificación se publiquen en la web del hotel (solo con mi
          nombre y la inicial del apellido)
        </span>
      </label>

      <div className="survey-form__actions">
        {error && (
          <p className="survey-form__error" role="alert">
            {error}
          </p>
        )}
        <button className="survey-button" type="submit" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar'}
        </button>
      </div>
    </form>
  )
}

export default SurveyForm
