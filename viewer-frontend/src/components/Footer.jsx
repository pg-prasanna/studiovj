import { useSettings } from '../hooks/useEvents'

export default function Footer() {
  const { settings } = useSettings()
  const copyrightText =
    settings?.copyrightText ||
    `© ${new Date().getFullYear()} ${settings?.studioName || 'Studio VJ'}. All rights reserved.`

  return (
    <footer className="mt-auto bg-white px-5 py-8 text-center">
      <div className="mx-auto max-w-[1100px]">
        {settings?.footerText && (
          <p className="m-0 mb-3 font-sans text-[0.78rem] text-[#4a4a4a]">{settings.footerText}</p>
        )}
        <p className="m-0 font-sans text-[0.68rem] font-normal uppercase tracking-[0.18em] text-gold sm:text-[0.74rem]">
          {copyrightText}
        </p>
      </div>
    </footer>
  )
}
