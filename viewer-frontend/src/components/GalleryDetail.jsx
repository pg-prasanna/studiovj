import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventById, useSettings } from '../hooks/useEvents'
import renderTitle from '../utils/renderTitle'
import vjLogo from '../assets/vjlogo.png'
import AlbumTabs from './gallery/AlbumTabs'
import MasonryGrid from './gallery/MasonryGrid'
import Lightbox from './gallery/Lightbox'
import Slideshow from './gallery/Slideshow'
import DownloadModal, { hasDownloadAccess } from './gallery/DownloadModal'
import AlbumDownloadModal from './gallery/AlbumDownloadModal'
import ShareModal from './gallery/ShareModal'
import EmailGate, { hasGalleryAccess } from './EmailGate'

export default function GalleryDetail() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { event, loading, error } = useEventById(eventId)
  const { settings } = useSettings()

  const [selectedAlbumId, setSelectedAlbumId] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [slideshowOpen, setSlideshowOpen] = useState(false)
  const [downloadPhoto, setDownloadPhoto] = useState(null)   // photo pending download
  const [sharePhoto, setSharePhoto] = useState(null)         // photo pending share
  const [albumDownloadOpen, setAlbumDownloadOpen] = useState(false) // album-wide ZIP download gate
  const [albumShareOpen, setAlbumShareOpen] = useState(false)       // album/gallery link share
  const [unlocked, setUnlocked] = useState(() => hasGalleryAccess(eventId))

  /* ── loading / error ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-center">
        <p className="font-sans text-muted">Loading gallery...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center">
        <h2 className="mb-2 font-display text-3xl font-light text-ink">Gallery not found</h2>
        <p className="mb-5 font-sans text-muted">{error || 'The event could not be found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="border border-gold px-8 py-3 text-[0.75rem] font-medium uppercase tracking-[0.1em] text-gold transition-colors hover:bg-gold hover:text-white"
        >
          Back to Home
        </button>
      </div>
    )
  }

  /* ── email gate ───────────────────────────────────────────────────────── */
  if (!unlocked) {
    return (
      <EmailGate
        event={event}
        eventId={eventId}
        onUnlock={() => setUnlocked(true)}
      />
    )
  }

  /* ── derive current album & photo list ───────────────────────────────── */
  const firstAlbumId = event.albums?.[0]?.id
  const currentAlbumId = selectedAlbumId || firstAlbumId
  const currentAlbum = event.albums?.find((a) => a.id === currentAlbumId)
  const photos = (currentAlbum?.photos || [])
    .slice()
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))

  const studioName = (settings?.studioName || 'Studio VJ').toUpperCase()

  /* ── download handler ────────────────────────────────────────────────── */
  const handleDownloadRequest = (photo) => {
    // If no download protection or already authenticated this session, download directly
    if (!event.downloadProtected || hasDownloadAccess(eventId)) {
      triggerDirectDownload(photo)
    } else {
      setDownloadPhoto(photo)
    }
  }

  const triggerDirectDownload = async (photo) => {
    try {
      const res = await fetch(photo.imageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `photo-${photo.id || Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(photo.imageUrl, '_blank')
    }
  }

  const handleViewGallery = () => {
    document.querySelector('.gallery-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleLogoClick = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative flex h-screen w-full items-end overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-full overflow-hidden">
          <img
            src={event.coverImageUrl}
            alt={event.title}
            loading="eager"
            className="block h-full w-full object-cover object-top"
          />
        </div>
        <div className="absolute left-0 top-0 z-[1] h-full w-full bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Logo */}
        <button
          type="button"
          onClick={handleLogoClick}
          aria-label="Go to Studio VJ home"
          className="absolute left-6 top-6 z-[2] flex items-center gap-2 text-left sm:left-10 sm:top-10"
        >
          <img src={vjLogo} alt="STUDIO VJ" className="h-8 w-8 object-contain sm:h-10 sm:w-10" />
          <div className="leading-tight">
            <p className="m-0 font-display text-sm font-light tracking-[0.2em] text-white sm:text-base">STUDIO VJ</p>
            <p className="m-0 text-[0.5rem] tracking-[0.25em] text-gold-light sm:text-[0.55rem]">MOMENTS BECOME ETERNITY</p>
          </div>
        </button>

        {/* Title + date */}
        <div className="relative z-[2] w-full px-6 pb-8 sm:px-10 sm:pb-10 md:pb-12">
          <div className="flex flex-col items-start justify-end gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-left">
              <h1 className="m-0 mb-2 font-display text-3xl font-light uppercase tracking-[0.03em] text-white drop-shadow-md sm:text-5xl md:text-[3.4rem]">
                {renderTitle(event.title)}
              </h1>
              <p className="m-0 text-[0.65rem] font-normal uppercase tracking-[0.18em] text-white/80 sm:text-[0.72rem]">
                {new Date(event.eventDate)
                  .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  .toUpperCase()}
              </p>
            </div>
            <button
              onClick={handleViewGallery}
              className="shrink-0 border border-white px-7 py-2.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-ink sm:px-8"
            >
              View Gallery
            </button>
          </div>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────────────────── */}
      <section className="gallery-section bg-white">
        <AlbumTabs
          title={event.title}
          studioName={studioName}
          albums={event.albums}
          currentAlbumId={currentAlbumId}
          onSelect={setSelectedAlbumId}
          onSlideshow={() => photos.length > 0 && setSlideshowOpen(true)}
          onDownload={() => currentAlbum && setAlbumDownloadOpen(true)}
          onShare={() => setAlbumShareOpen(true)}
        />
        <div className="px-1.5 py-1.5 sm:px-2 sm:py-2">
          <MasonryGrid
            photos={photos}
            albumName={currentAlbum?.albumName}
            onSelect={setLightboxIndex}
            onDownload={handleDownloadRequest}
            onShare={(photo) => setSharePhoto(photo)}
          />
        </div>
      </section>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}

      {slideshowOpen && photos.length > 0 && (
        <Slideshow
          photos={photos}
          onClose={() => setSlideshowOpen(false)}
        />
      )}

      {downloadPhoto && (
        <DownloadModal
          eventId={eventId}
          photo={downloadPhoto}
          studioName={studioName}
          onClose={() => setDownloadPhoto(null)}
        />
      )}

      {sharePhoto && (
        <ShareModal
          photo={sharePhoto}
          onClose={() => setSharePhoto(null)}
        />
      )}

      {albumDownloadOpen && currentAlbum && (
        <AlbumDownloadModal
          eventId={eventId}
          album={currentAlbum}
          studioName={studioName}
          onClose={() => setAlbumDownloadOpen(false)}
        />
      )}

      {albumShareOpen && (
        <ShareModal
          url={window.location.href}
          onClose={() => setAlbumShareOpen(false)}
        />
      )}
    </div>
  )
}
