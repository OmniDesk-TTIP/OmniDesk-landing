import { useEffect, useRef, type ReactNode } from 'react'
import './survey-button.css'
import './survey-message.css'

type SurveyMessageProps = {
  title: string
  children: ReactNode
  action?: { label: string; onClick: () => void }
}

function SurveyMessage({ title, children, action }: SurveyMessageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  return (
    <section className="survey-message">
      <h1 ref={titleRef} className="survey-message__title" tabIndex={-1}>
        {title}
      </h1>
      <div className="survey-message__body">{children}</div>
      {action && (
        <button className="survey-button survey-message__action" type="button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </section>
  )
}

export default SurveyMessage
