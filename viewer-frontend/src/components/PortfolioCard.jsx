import { useNavigate } from 'react-router-dom'
import renderTitle from '../utils/renderTitle'

export default function PortfolioCard({ eventId, image, coupleName, date }) {
  const navigate = useNavigate()

  const handleViewGallery = () => {
    navigate(`/gallery/${eventId}`)
  }

  return (
    <div className="group cursor-pointer" onClick={handleViewGallery}>
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-cream">
        <img
          src={image}
          alt={coupleName}
          loading="lazy"
          decoding="async"
          className="absolute left-0 top-0 h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
        />
      </div>
      <div className="pt-5 text-center">
        <h3 className="m-0 mb-1.5 font-display text-lg font-light uppercase tracking-[0.05em] text-ink sm:text-xl">
          {renderTitle(coupleName)}
        </h3>
        <p className="m-0 font-sans text-[0.6rem] font-medium uppercase tracking-[0.18em] text-gold sm:text-[0.66rem]">
          {date}
        </p>
      </div>
    </div>
  )
}
