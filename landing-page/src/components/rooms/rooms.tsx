import { ROOMS } from './rooms-data.ts'
import './rooms.css'

const formatPrice = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format

const pad = (value: number) => String(value).padStart(2, '0')

type RoomsProps = {
  activeIndex: number
}

function Rooms({ activeIndex }: RoomsProps) {
  return (
    <section className="rooms" aria-labelledby="rooms-title">
      <div className="rooms__gallery">
        <div className="rooms__track">
          {ROOMS.map((room, index) => (
            <article
              key={room.id}
              className="rooms__slide"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${ROOMS.length}: ${room.name}`}
            >
              <div className="rooms__media">
                <img
                  className="rooms__image"
                  src={room.image.large}
                  srcSet={`${room.image.small} 1200w, ${room.image.large} 2400w`}
                  sizes="120vw"
                  alt={room.image.alt}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="rooms__shade" aria-hidden="true" />

              <div className="rooms__info">
                <h3 className="rooms__name">{room.name}</h3>
                <p className="rooms__description">{room.description}</p>
                <ul className="rooms__specs">
                  {room.specs.map((spec) => (
                    <li key={spec}>{spec}</li>
                  ))}
                </ul>
                <div className="rooms__footer">
                  <p className="rooms__price">
                    Desde <strong>{formatPrice(room.pricePerNight)}</strong> / noche
                  </p>
                  <a className="rooms__cta" href="#reservar">
                    Reservar
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <header className="rooms__hud">
          <h2 id="rooms-title" className="rooms__title">
            Habitaciones <em>&amp; suites</em>
          </h2>
          <p className="rooms__counter" aria-hidden="true">
            <span className="rooms__counter-current">{pad(activeIndex + 1)}</span> / {pad(ROOMS.length)}
          </p>
        </header>

        <div className="rooms__progress" aria-hidden="true">
          <span className="rooms__progress-bar" />
        </div>
      </div>
    </section>
  )
}

export default Rooms
