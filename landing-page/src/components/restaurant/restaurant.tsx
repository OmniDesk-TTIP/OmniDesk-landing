import { useEffect, useState, type ReactNode } from 'react'
import restaurantFallback from '../../assets/cube-images/hotel-restaurant.webp'
import {
  getPublicRestaurant,
  getRestaurantPhotoUrl,
  type PublicRestaurant,
} from '../../services/restaurant-api.ts'
import './restaurant.css'

const SKELETON_TILES = 3

type RestaurantState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; restaurant: PublicRestaurant }

function RestaurantHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="restaurant__header">
      <p className="restaurant__eyebrow">Restaurante</p>
      <h2 id="restaurant-title" className="restaurant__title">
        Sabores de estación, <em>desayuno incluido</em>
      </h2>
      {children}
    </header>
  )
}

function Restaurant() {
  const [state, setState] = useState<RestaurantState>({ status: 'loading' })
  const [failedPhotos, setFailedPhotos] = useState<ReadonlySet<string>>(() => new Set())

  useEffect(() => {
    const controller = new AbortController()

    void getPublicRestaurant(controller.signal).then((restaurant) => {
      if (controller.signal.aborted) return
      setState(restaurant ? { status: 'ready', restaurant } : { status: 'error' })
    })

    return () => controller.abort()
  }, [])

  const hidePhoto = (id: string) => setFailedPhotos((previous) => new Set(previous).add(id))

  if (state.status === 'loading') {
    return (
      <section id="restaurante" className="restaurant" aria-labelledby="restaurant-title" aria-busy="true">
        <RestaurantHeader />
        <div className="restaurant__cover restaurant__bone" aria-hidden="true" />
        <ul className="restaurant__gallery" aria-hidden="true">
          {Array.from({ length: SKELETON_TILES }, (_, index) => (
            <li key={index} className="restaurant__tile restaurant__bone" />
          ))}
        </ul>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section id="restaurante" className="restaurant" aria-labelledby="restaurant-title">
        <RestaurantHeader>
          <p className="restaurant__message" role="status">
            No pudimos cargar el restaurante en este momento. Probá recargar la página en unos minutos.
          </p>
        </RestaurantHeader>
      </section>
    )
  }

  const { restaurant } = state
  if (!restaurant.available) return null

  // The admin's order is kept: the first visible photo is the cover, and a broken one hands its place to the next.
  const [cover, ...gallery] = restaurant.photos
    .map((photo, index) => ({ ...photo, alt: `Foto ${index + 1} del restaurante del hotel` }))
    .filter((photo) => !failedPhotos.has(photo.id))

  return (
    <section id="restaurante" className="restaurant" aria-labelledby="restaurant-title">
      <RestaurantHeader>
        {restaurant.description && <p className="restaurant__description">{restaurant.description}</p>}
      </RestaurantHeader>

      <div className="restaurant__cover">
        {cover ? (
          <img
            key={cover.id}
            className="restaurant__image"
            src={getRestaurantPhotoUrl(cover)}
            alt={cover.alt}
            decoding="async"
            onError={() => hidePhoto(cover.id)}
          />
        ) : (
          <img
            className="restaurant__image"
            src={restaurantFallback}
            alt="Restaurante del hotel"
            decoding="async"
          />
        )}
      </div>

      {gallery.length > 0 && (
        <ul className="restaurant__gallery">
          {gallery.map((photo) => (
            <li key={photo.id} className="restaurant__tile">
              <img
                className="restaurant__image"
                src={getRestaurantPhotoUrl(photo)}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                onError={() => hidePhoto(photo.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Restaurant
