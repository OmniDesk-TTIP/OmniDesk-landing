import type { ReactNode } from 'react'
import { DEFAULT_ROOM_IMAGE, type Room, type RoomImage } from './rooms-data.ts'
import type { RoomsState } from './use-public-rooms.ts'
import './rooms.css'

const formatPrice = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format

const formatCapacity = (capacity: number) => `Hasta ${capacity} ${capacity === 1 ? 'persona' : 'personas'}`

const pad = (value: number) => String(value).padStart(2, '0')

function RoomMedia({ image }: { image: RoomImage }) {
  return (
    <>
      <div className="rooms__media">
        <img
          className="rooms__image"
          src={image.large}
          srcSet={`${image.small} 1200w, ${image.large} 2400w`}
          sizes="120vw"
          alt={image.alt}
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="rooms__shade" aria-hidden="true" />
    </>
  )
}

function RoomSlide({ room, label }: { room: Room; label: string }) {
  return (
    <article className="rooms__slide" aria-roledescription="slide" aria-label={label}>
      <RoomMedia image={room.image} />

      <div className="rooms__info">
        <h3 className="rooms__name">{room.name}</h3>
        {room.description && <p className="rooms__description">{room.description}</p>}
        <ul className="rooms__specs">
          {[formatCapacity(room.capacity), ...room.features].map((spec) => (
            <li key={spec}>{spec}</li>
          ))}
        </ul>
        <div className="rooms__footer">
          <p className="rooms__price">
            <strong>{formatPrice(room.pricePerNight)}</strong> / noche
          </p>
          <a className="rooms__cta" href="#reservar">
            Reservar
          </a>
        </div>
      </div>
    </article>
  )
}

function RoomsNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rooms__slide">
      <RoomMedia image={DEFAULT_ROOM_IMAGE} />
      <div className="rooms__info">{children}</div>
    </div>
  )
}

function RoomsPlaceholder({ state }: { state: RoomsState }) {
  if (state.status === 'loading') {
    return (
      <RoomsNotice>
        <div className="rooms__skeleton" aria-hidden="true">
          <span className="rooms__bone rooms__bone--name" />
          <span className="rooms__bone rooms__bone--line" />
          <span className="rooms__bone rooms__bone--line rooms__bone--short" />
          <span className="rooms__bone rooms__bone--specs" />
          <span className="rooms__bone rooms__bone--price" />
        </div>
      </RoomsNotice>
    )
  }

  if (state.status === 'error') {
    return (
      <RoomsNotice>
        <p className="rooms__notice" role="status">
          No pudimos cargar las habitaciones en este momento.
        </p>
        <p className="rooms__description">Probá recargar la página en unos minutos.</p>
      </RoomsNotice>
    )
  }

  return (
    <RoomsNotice>
      <p className="rooms__notice">Consultanos por disponibilidad.</p>
      <div className="rooms__footer">
        <a className="rooms__cta" href="#reservar">
          Consultar
        </a>
      </div>
    </RoomsNotice>
  )
}

type RoomsProps = {
  state: RoomsState
  activeIndex: number
}

function Rooms({ state, activeIndex }: RoomsProps) {
  const rooms = state.status === 'ready' ? state.rooms : []

  return (
    <section className="rooms" aria-labelledby="rooms-title" aria-busy={state.status === 'loading' || undefined}>
      <div className="rooms__gallery">
        <div className="rooms__track">
          {rooms.length ? (
            rooms.map((room, index) => (
              <RoomSlide key={room.id} room={room} label={`${index + 1} de ${rooms.length}: ${room.name}`} />
            ))
          ) : (
            <RoomsPlaceholder state={state} />
          )}
        </div>

        <header className="rooms__hud">
          <h2 id="rooms-title" className="rooms__title">
            Habitaciones <em>&amp; suites</em>
          </h2>
          {rooms.length > 0 && (
            <p className="rooms__counter" aria-hidden="true">
              <span className="rooms__counter-current">{pad(Math.min(activeIndex, rooms.length - 1) + 1)}</span> /{' '}
              {pad(rooms.length)}
            </p>
          )}
        </header>

        <div className="rooms__progress" aria-hidden="true">
          <span className="rooms__progress-bar" />
        </div>
      </div>
    </section>
  )
}

export default Rooms
