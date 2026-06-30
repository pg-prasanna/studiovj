import { Globe, Phone, Mail, MapPin } from 'lucide-react'
import vjLogo from '../assets/vjlogo.png'
import { useSettings } from '../hooks/useEvents'

export default function Header() {
  const { settings } = useSettings()

  const studioName = settings?.studioName || 'Studio VJ'
  const tagline = settings?.tagline || ''
  const sinceYear = settings?.sinceYear
  const logoUrl = settings?.logoUrl || vjLogo
  const website = settings?.website
  const phone = settings?.phone
  const email = settings?.email
  const address = settings?.address
  const heroHeading = settings?.heroHeading
  const heroSubheading = settings?.heroSubheading

  return (
    <header className="bg-white px-5 pb-8 pt-8 sm:pt-10">
      <div className="mx-auto max-w-[900px] text-center">
        {/* Logo Section */}
        <div className="mb-9">
          <img
            src={logoUrl}
            alt={studioName}
            className="mx-auto mb-5 h-auto w-20 object-contain sm:w-24"
          />
          <h1 className="m-0 font-display text-3xl font-light uppercase tracking-[0.22em] text-ink sm:text-4xl md:text-[2.75rem]">
            {studioName}
          </h1>
          {tagline && (
            <p className="m-0 mt-3 text-[0.62rem] font-normal uppercase tracking-[0.32em] text-gold sm:text-[0.7rem]">
              {tagline}
            </p>
          )}
          {sinceYear && (
            <p className="m-0 mt-1 text-[0.62rem] font-normal uppercase tracking-[0.32em] text-gold sm:text-[0.7rem]">
              Since {sinceYear}
            </p>
          )}
        </div>

        {/* Hero Heading / Subheading */}
        {(heroHeading || heroSubheading) && (
          <div className="mx-auto mb-6 max-w-[700px]">
            {heroHeading && (
              <h2 className="m-0 mb-3 font-display text-xl font-light uppercase tracking-[0.18em] text-ink sm:text-2xl">
                {heroHeading}
              </h2>
            )}
            {heroSubheading && (
              <p className="m-0 px-2 font-sans text-[0.85rem] font-light leading-[1.9] text-[#4a4a4a] sm:text-[0.95rem]">
                {heroSubheading}
              </p>
            )}
          </div>
        )}

        {/* Biography Section */}
        <div className="mx-auto max-w-[700px]">
          {settings?.aboutText1 && (
            <p className="m-0 mb-5 px-2 font-sans text-[0.85rem] font-light leading-[1.9] text-[#4a4a4a] sm:text-[0.95rem]">
              {settings.aboutText1}
            </p>
          )}
          {settings?.aboutText2 && (
            <p className="m-0 mb-5 px-2 font-sans text-[0.85rem] font-light leading-[1.9] text-[#4a4a4a] sm:text-[0.95rem]">
              {settings.aboutText2}
            </p>
          )}
          {settings?.aboutText3 && (
            <p className="m-0 px-2 font-sans text-[0.85rem] font-light leading-[1.9] text-[#4a4a4a] sm:text-[0.95rem]">
              {settings.aboutText3}
            </p>
          )}
        </div>

        {/* Contact Information */}
        <div className="mt-8 flex flex-col items-center gap-y-4 px-2">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
          {website && (
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-[0.78rem] font-normal text-ink transition-colors hover:text-gold sm:text-[0.88rem]"
            >
              <Globe size={15} strokeWidth={1.4} className="shrink-0 text-gold" />
              {website}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 font-sans text-[0.78rem] font-normal text-ink transition-colors hover:text-gold sm:text-[0.88rem]"
            >
              <Phone size={15} strokeWidth={1.4} className="shrink-0 text-gold" />
              {phone}
            </a>
          )}
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 font-sans text-[0.78rem] font-normal text-ink transition-colors hover:text-gold sm:text-[0.88rem]"
            >
              <Mail size={15} strokeWidth={1.4} className="shrink-0 text-gold" />
              {email}
            </a>
          )}
          </div>
          {address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-[0.78rem] font-normal text-ink transition-colors hover:text-gold sm:text-[0.88rem]"
            >
              <MapPin size={15} strokeWidth={1.4} className="shrink-0 text-gold" />
              {address}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
