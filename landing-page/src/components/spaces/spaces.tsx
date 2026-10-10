import { SPACES } from './spaces-data.ts'
import './spaces.css'

type SpacesProps = {
  activeIndex: number
}

function Spaces({ activeIndex }: SpacesProps) {
  return (
    <section className="spaces" aria-labelledby="spaces-title">
      <header className="spaces__header">
        <p className="spaces__eyebrow">Los espacios</p>
        <h2 id="spaces-title" className="spaces__title">
          Seis espacios, <em>una sola calma</em>
        </h2>
        <p className="spaces__intro">
          Arquitectura cálida, materiales nobles y luz natural. Recorré Alma desde la llegada hasta el
          atardecer.
        </p>
      </header>

      <ol className="spaces__list">
        {SPACES.map((space, index) => (
          <li
            key={space.face}
            className={`spaces__item${index === activeIndex ? ' spaces__item--active' : ''}`}
          >
            <span className="spaces__number">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="spaces__name">{space.title}</h3>
            <p className="spaces__description">{space.description}</p>
            <ul className="spaces__details">
              {space.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default Spaces
