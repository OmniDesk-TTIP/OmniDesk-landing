import { useEffect, useRef, useState } from 'react'
import SurveyForm, { type SurveyDraft } from '../../components/survey/survey-form.tsx'
import SurveyMessage from '../../components/survey/survey-message.tsx'
import {
  fetchSurvey,
  getRatingFields,
  submitSurvey,
  type SurveyData,
  type SurveyAnswers,
  type SurveyResult,
} from '../../components/survey/survey-api.ts'
import './survey.css'

const PAGE_TITLE = 'Encuesta de satisfacción · Alma Hotel'

const EMPTY_DRAFT: SurveyDraft = { ratings: {}, comment: '', publishConsent: false }

type View =
  | { name: 'loading' }
  | { name: 'form'; survey: SurveyData }
  | { name: 'answered' }
  | { name: 'expired' }
  | { name: 'not-found' }
  | { name: 'error'; retry: () => void }
  | { name: 'thanks'; guestFirstName: string; publishConsent: boolean }

const buildAnswers = (survey: SurveyData, draft: SurveyDraft) => {
  const answers: SurveyAnswers = {}
  for (const field of getRatingFields(survey)) {
    const rating = draft.ratings[field]
    if (rating !== undefined) answers[field] = rating
  }
  const comment = draft.comment.trim()
  if (comment) answers.comment = comment
  answers.publishConsent = draft.publishConsent
  return answers
}

const getLoadedView = (result: SurveyResult, retry: () => void): View => {
  switch (result.type) {
    case 'ok':
      if (result.survey.status === 'OPEN') return { name: 'form', survey: result.survey }
      if (result.survey.status === 'ANSWERED') return { name: 'answered' }
      return { name: 'expired' }
    case 'answered':
      return { name: 'answered' }
    case 'expired':
      return { name: 'expired' }
    case 'not-found':
      return { name: 'not-found' }
    default:
      return { name: 'error', retry }
  }
}

type SurveyProps = {
  token: string
}

function Survey({ token }: SurveyProps) {
  const [view, setView] = useState<View>({ name: 'loading' })
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const submittingRef = useRef(false)

  useEffect(() => {
    document.title = PAGE_TITLE
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const retry = () => {
      setView({ name: 'loading' })
      setLoadAttempt((attempt) => attempt + 1)
    }

    void fetchSurvey(token, controller.signal).then((result) => {
      if (!controller.signal.aborted) setView(getLoadedView(result, retry))
    })

    return () => controller.abort()
  }, [token, loadAttempt])

  const send = async (survey: SurveyData, answers: SurveyAnswers) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setSubmitError(null)

    const result = await submitSurvey(token, answers)

    submittingRef.current = false
    setSubmitting(false)

    switch (result.type) {
      case 'ok':
        setView({
          name: 'thanks',
          guestFirstName: result.survey.guestFirstName || survey.guestFirstName,
          publishConsent: answers.publishConsent === true,
        })
        break
      case 'invalid':
        setSubmitError(result.message)
        break
      case 'answered':
        setView({ name: 'answered' })
        break
      case 'expired':
        setView({ name: 'expired' })
        break
      case 'not-found':
        setView({ name: 'not-found' })
        break
      case 'unavailable':
        setView({
          name: 'error',
          retry: () => {
            setView({ name: 'form', survey })
            void send(survey, answers)
          },
        })
        break
    }
  }

  const renderView = () => {
    switch (view.name) {
      case 'loading':
        return (
          <p className="survey__status" role="status">
            Cargando encuesta…
          </p>
        )
      case 'form':
        return (
          <SurveyForm
            survey={view.survey}
            draft={draft}
            onDraftChange={setDraft}
            onSubmit={() => void send(view.survey, buildAnswers(view.survey, draft))}
            submitting={submitting}
            error={submitError}
          />
        )
      case 'answered':
        return (
          <SurveyMessage title="Encuesta respondida">
            <p>Ya recibimos tu opinión sobre esta estadía. ¡Gracias!</p>
          </SurveyMessage>
        )
      case 'expired':
        return (
          <SurveyMessage title="Link vencido">
            <p>Este link ya no está disponible.</p>
          </SurveyMessage>
        )
      case 'not-found':
        return (
          <SurveyMessage title="Link inválido">
            <p>No encontramos esta encuesta. Revisá que el link esté completo.</p>
          </SurveyMessage>
        )
      case 'error':
        return (
          <SurveyMessage
            title="No pudimos conectarnos"
            action={{ label: 'Reintentar', onClick: view.retry }}
          >
            <p>
              Hubo un problema al comunicarnos con el hotel. Revisá tu conexión e intentá de nuevo.
            </p>
          </SurveyMessage>
        )
      case 'thanks':
        return (
          <SurveyMessage title={`¡Gracias, ${view.guestFirstName}!`}>
            <p>Tu opinión nos ayuda a seguir mejorando cada estadía.</p>
            {view.publishConsent && (
              <p>
                Tu comentario y tu calificación pueden aparecer en la web del hotel después de que el
                equipo los revise.
              </p>
            )}
          </SurveyMessage>
        )
    }
  }

  return (
    <div className="survey">
      <header className="survey__brand">
        <a className="survey__logo" href="/">
          <span className="survey__logo-mark" aria-hidden="true">
            A
          </span>
          Alma Hotel
        </a>
      </header>
      <main className="survey__main">{renderView()}</main>
    </div>
  )
}

export default Survey
