import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { ROOM_PLACEHOLDER, type Room, type RoomPhoto } from './rooms-data.ts'
import type { RoomsState } from './use-public-rooms.ts'
import './rooms.css'

const formatPrice = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
}).format

const formatCapacity = (capacity: number) => `Hasta ${capacity} ${capacity === 1 ? 'persona' : 'personas'}`

const pad = (value: number) => String(value).padStart(2, '0')

type RoomPhotoImageProps = {
  photo?: RoomPhoto
  fallbackAlt: string
  className: string
  sizes: string
}

// Shows the placeholder when there is no photo or it fails to load. Key it by photo id so a new photo gets a fresh try.
function RoomPhotoImage({ photo, fallbackAlt, className, sizes }: RoomPhotoImageProps) {
  const [failed, setFailed] = useState(false)

  if (!photo || failed) {
    return (
      <img
        className={className}
        src={ROOM_PLACEHOLDER.src}
        srcSet={ROOM_PLACEHOLDER.srcSet}
        sizes={sizes}
        alt={fallbackAlt}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <img
      className={className}
      src={photo.src}
      alt={photo.alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}

function RoomMedia({ photo, fallbackAlt }: { photo?: RoomPhoto; fallbackAlt: string }) {
  return (
    <>
      <div className="rooms__media">
        <RoomPhotoImage
          key={photo?.id}
          className="rooms__image"
          photo={photo}
          fallbackAlt={fallbackAlt}
          sizes="120vw"
        />
      </div>
      <div className="rooms__shade" aria-hidden="true" />
    </>
  )
}

type RoomSlideProps = {
  room: Room
  label: string
  onOpenPhotos: () => void
}

function RoomSlide({ room, label, onOpenPhotos }: RoomSlideProps) {
  return (
    <article className="rooms__slide" aria-roledescription="slide" aria-label={label}>
      <RoomMedia photo={room.photos[0]} fallbackAlt={`Habitación ${room.name}`} />

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
          {room.photos.length > 1 && (
            <button className="rooms__photos-button" type="button" onClick={onOpenPhotos}>
              Ver {room.photos.length} fotos
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function RoomsNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rooms__slide">
      <RoomMedia fallbackAlt="Habitación del hotel" />
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

type PhotoViewer = { room: Room; index: number }

type RoomPhotosDialogProps = {
  viewer: PhotoViewer | null
  onIndexChange: (index: number) => void
  onClose: () => void
}

function RoomPhotosDialog({ viewer, onIndexChange, onClose }: RoomPhotosDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (viewer && !dialog?.open) dialog?.showModal()
  }, [viewer])

  const count = viewer?.room.photos.length ?? 0
  const step = (delta: number) => viewer && onIndexChange((viewer.index + delta + count) % count)

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowLeft') step(-1)
    if (event.key === 'ArrowRight') step(1)
  }

  return (
    <dialog
      ref={dialogRef}
      className="room-photos"
      aria-labelledby="room-photos-title"
      onClose={onClose}
      onKeyDown={handleKeyDown}
      onClick={(event) => event.target === event.currentTarget && dialogRef.current?.close()}
    >
      {viewer && (
        <>
          <header className="room-photos__header">
            <h3 id="room-photos-title" className="room-photos__title">
              {viewer.room.name}
            </h3>
            <p className="room-photos__count" aria-live="polite">
              Foto {viewer.index + 1} de {count}
            </p>
            <button
              className="room-photos__close"
              type="button"
              aria-label="Cerrar fotos"
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
          </header>

          <div className="room-photos__frame">
            <RoomPhotoImage
              key={viewer.room.photos[viewer.index].id}
              className="room-photos__image"
              photo={viewer.room.photos[viewer.index]}
              fallbackAlt={`Habitación ${viewer.room.name}`}
              sizes="90vw"
            />
            <button
              className="room-photos__nav room-photos__nav--prev"
              type="button"
              aria-label="Foto anterior"
              onClick={() => step(-1)}
            >
              ‹
            </button>
            <button
              className="room-photos__nav room-photos__nav--next"
              type="button"
              aria-label="Foto siguiente"
              onClick={() => step(1)}
            >
              ›
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}

type RoomsProps = {
  state: RoomsState
  activeIndex: number
}

function Rooms({ state, activeIndex }: RoomsProps) {
  const [viewer, setViewer] = useState<PhotoViewer | null>(null)
  const rooms = state.status === 'ready' ? state.rooms : []

  return (
    <section className="rooms" aria-labelledby="rooms-title" aria-busy={state.status === 'loading' || undefined}>
      <div className="rooms__gallery">
        <div className="rooms__track">
          {rooms.length ? (
            rooms.map((room, index) => (
              <RoomSlide
                key={room.id}
                room={room}
                label={`${index + 1} de ${rooms.length}: ${room.name}`}
                onOpenPhotos={() => setViewer({ room, index: 0 })}
              />
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

      {/* Outside the gallery: GSAP toggles the gallery's visibility, which the open dialog would inherit. */}
      <RoomPhotosDialog
        viewer={viewer}
        onIndexChange={(index) => setViewer((current) => current && { ...current, index })}
        onClose={() => setViewer(null)}
      />
    </section>
  )
}

export default Rooms
