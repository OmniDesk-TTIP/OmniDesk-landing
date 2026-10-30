import { useEffect, useState, type ReactNode } from 'react'
import spaFallback from '../../assets/cube-images/hotel-spa.webp'
import { getPublicSpa, getSpaPhotoUrl, type PublicSpa, type PublicSpaService } from '../../services/spa-api.ts'
import { formatDuration, formatPrice, formatSchedule } from './spa-format.ts'
import './spa.css'

const SKELETON_CARDS = 3
const FALLBACK_ALT = 'Spa del hotel'

type SpaState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; spa: PublicSpa }

function SpaHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="spa__header">
      <p className="spa__eyebrow">Spa</p>
      <h2 id="spa-title" className="spa__title">
        Tiempo para vos, <em>sin reloj</em>
      </h2>
      <p className="spa__intro">
        Piscina climatizada, sauna y masajes para soltar el cansancio del viaje. Sin cargo para los huéspedes del
        hotel.
      </p>
      {children}
    </header>
  )
}

function SpaServiceCard({ service }: { service: PublicSpaService }) {
  return (
    <article className="spa__service">
      <div className="spa__service-heading">
        <h3 className="spa__service-name">{service.name}</h3>
        <span className="spa__service-duration">{formatDuration(service.durationMinutes)}</span>
      </div>
      {service.description && <p className="spa__service-description">{service.description}</p>}
      <p className="spa__service-schedule">
        {formatSchedule(service.availableWeekdays, service.opensAt, service.closesAt)}
      </p>
      <div className="spa__service-price">
        <strong>{formatPrice(service.price)}</strong>
        <span>Sin cargo para huéspedes del hotel</span>
      </div>
    </article>
  )
}

function Spa() {
  const [state, setState] = useState<SpaState>({ status: 'loading' })
  const [failedPhotos, setFailedPhotos] = useState<ReadonlySet<string>>(() => new Set())

  useEffect(() => {
    const controller = new AbortController()

    void getPublicSpa(controller.signal).then((spa) => {
      if (controller.signal.aborted) return
      setState(spa ? { status: 'ready', spa } : { status: 'error' })
    })

    return () => controller.abort()
  }, [])

  const hidePhoto = (id: string) => setFailedPhotos((previous) => new Set(previous).add(id))

  if (state.status === 'loading') {
    return (
      <section id="spa" className="spa" aria-labelledby="spa-title" aria-busy="true">
        <SpaHeader />
        <div className="spa__cover spa__bone" aria-hidden="true" />
        <ul className="spa__services" aria-hidden="true">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <li key={index} className="spa__service spa__service--skeleton spa__bone" />
          ))}
        </ul>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section id="spa" className="spa" aria-labelledby="spa-title">
        <SpaHeader>
          <p className="spa__message" role="status">
            No pudimos cargar los servicios del spa en este momento. Probá recargar la página en unos minutos.
          </p>
        </SpaHeader>
      </section>
    )
  }

  const { services, photos } = state.spa
  if (!services.length && !photos.length) return null

  // The admin's order is kept: the first photo is the cover (placeholder if it fails), broken gallery photos are dropped.
  const [cover, ...rest] = photos.map((photo, index) => ({ ...photo, alt: `Foto ${index + 1} del spa del hotel` }))
  const gallery = rest.filter((photo) => !failedPhotos.has(photo.id))
  const showCover = cover && !failedPhotos.has(cover.id)

  return (
    <section id="spa" className="spa" aria-labelledby="spa-title">
      <SpaHeader />

      <div className="spa__cover">
        {showCover ? (
          <img
            key={cover.id}
            className="spa__image"
            src={getSpaPhotoUrl(cover)}
            alt={cover.alt}
            decoding="async"
            onError={() => hidePhoto(cover.id)}
          />
        ) : (
          <img className="spa__image" src={spaFallback} alt={FALLBACK_ALT} decoding="async" />
        )}
      </div>

      {gallery.length > 0 && (
        <ul className="spa__gallery">
          {gallery.map((photo) => (
            <li key={photo.id} className="spa__tile">
              <img
                className="spa__image"
                src={getSpaPhotoUrl(photo)}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                onError={() => hidePhoto(photo.id)}
              />
            </li>
          ))}
        </ul>
      )}

      <h3 className="spa__subtitle">Servicios</h3>
      {services.length ? (
        <ul className="spa__services">
          {services.map((service) => (
            <li key={service.id}>
              <SpaServiceCard service={service} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="spa__message">Consultanos por los servicios disponibles.</p>
      )}
    </section>
  )
}

export default Spa
