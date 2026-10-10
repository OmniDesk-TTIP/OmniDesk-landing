import './hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <p className="hero__eyebrow hero__reveal">Alma Hotel</p>
        <h1 className="hero__title">
          <span className="hero__line hero__reveal">El arte</span>
          <span className="hero__gap" aria-hidden="true" />
          <span className="hero__line hero__reveal">
            de <em>recibir</em>
          </span>
        </h1>
        <p className="hero__subtitle hero__reveal">Hospitalidad pensada en cada detalle</p>
      </div>
    </section>
  )
}

export default Hero
