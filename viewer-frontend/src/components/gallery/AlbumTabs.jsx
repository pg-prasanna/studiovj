import { useState, useRef, useEffect, useCallback } from 'react'
import { Download, Share2, Play, ChevronDown } from 'lucide-react'
import renderTitle from '../../utils/renderTitle'

/**
 * Sticky gallery header — Studio SN layout.
 * Desktop: [title+studio LEFT] [album tabs CENTER] [controls RIGHT]
 * Mobile: [title+studio] on top row, [album tabs — horizontally scrollable] on second row
 */
export default function AlbumTabs({ title, studioName, albums = [], currentAlbumId, onSelect, onSlideshow, onDownload, onShare }) {
  const [moreOpen, setMoreOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(albums.length)
  const moreRef = useRef(null)
  const navRef = useRef(null)
  const tabRefs = useRef([])

  const recalculate = useCallback(() => {
    if (!navRef.current || albums.length === 0) return
    const navWidth = navRef.current.offsetWidth
    const moreButtonWidth = 80
    const gap = 28
    let used = 0
    let count = 0
    for (let i = 0; i < tabRefs.current.length; i++) {
      const el = tabRefs.current[i]
      if (!el) continue
      const w = el.scrollWidth + gap
      if (used + w <= navWidth - (count < albums.length - 1 ? moreButtonWidth : 0)) {
        used += w
        count++
      } else {
        break
      }
    }
    setVisibleCount(Math.max(1, count))
  }, [albums.length])

  useEffect(() => {
    const observer = new ResizeObserver(recalculate)
    if (navRef.current) observer.observe(navRef.current)
    recalculate()
    return () => observer.disconnect()
  }, [recalculate, albums])

  useEffect(() => {
    if (!moreOpen) return
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [moreOpen])

  const visible = albums.slice(0, visibleCount)
  const overflow = albums.slice(visibleCount)
  const hasMore = overflow.length > 0

  const tabClass = (id) =>
    `whitespace-nowrap pb-1 font-sans text-[0.62rem] font-medium uppercase tracking-[0.16em] transition-colors sm:text-[0.68rem] ${
      currentAlbumId === id
        ? 'border-b border-ink text-ink'
        : 'border-b border-transparent text-muted hover:text-gold'
    }`

  return (
    <div className="sticky top-0 z-20 border-b border-hairline bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-8">

        {/* Desktop: Single row layout [title+studio LEFT] [album tabs CENTER] [controls RIGHT] */}
        <div className="hidden sm:flex items-center gap-6 min-w-0">

          {/* Event info — left */}
          <div className="shrink-0 text-left">
            <h2 className="m-0 font-display text-xl font-light uppercase tracking-[0.08em] text-ink sm:text-2xl">
              {renderTitle(title)}
            </h2>
            {studioName && (
              <p className="m-0 mt-0.5 text-[0.6rem] font-medium uppercase tracking-[0.3em] text-gold">
                {studioName}
              </p>
            )}
          </div>

          {/* Album tabs — center, grows to fill space */}
          {albums.length > 0 && (
          <nav ref={navRef} className="flex-1 flex min-w-0 items-center gap-4 overflow-hidden sm:gap-7">
            {/* Hidden measurement layer */}
            <div className="pointer-events-none absolute opacity-0" aria-hidden="true" style={{ display: 'flex', gap: '1.75rem', position: 'fixed', top: -9999, left: -9999 }}>
              {albums.map((album, i) => (
                <button
                  key={album.id}
                  ref={(el) => { tabRefs.current[i] = el }}
                  className="whitespace-nowrap font-sans text-[0.68rem] font-medium uppercase tracking-[0.16em]"
                  tabIndex={-1}
                >
                  {album.albumName}
                </button>
              ))}
            </div>

            {visible.map((album) => (
              <button
                key={album.id}
                onClick={() => onSelect(album.id)}
                className={tabClass(album.id)}
              >
                {album.albumName}
              </button>
            ))}

            {hasMore && (
              <div ref={moreRef} className="relative shrink-0">
                <button
                  onClick={() => setMoreOpen((o) => !o)}
                  className={`flex items-center gap-1 pb-1 font-sans text-[0.62rem] font-medium uppercase tracking-[0.16em] transition-colors sm:text-[0.68rem] ${
                    overflow.some((a) => a.id === currentAlbumId)
                      ? 'border-b border-ink text-ink'
                      : 'border-b border-transparent text-muted hover:text-gold'
                  }`}
                >
                  More <ChevronDown size={11} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <div className="absolute left-0 top-full mt-2 min-w-[160px] border border-hairline bg-white shadow-lg z-30">
                    {overflow.map((album) => (
                      <button
                        key={album.id}
                        onClick={() => { onSelect(album.id); setMoreOpen(false) }}
                        className={`block w-full px-4 py-2.5 text-left font-sans text-[0.65rem] uppercase tracking-[0.12em] transition-colors hover:bg-cream ${
                          currentAlbumId === album.id ? 'text-ink font-semibold' : 'text-muted'
                        }`}
                      >
                        {album.albumName}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
          )}

          {/* Controls — right, always visible */}
          <div className="flex shrink-0 items-center gap-4 text-ink/70 ml-auto">
            <button aria-label="Download album" onClick={onDownload} className="transition-colors hover:text-gold">
              <Download size={17} strokeWidth={1.4} />
            </button>
            <button aria-label="Share album" onClick={onShare} className="transition-colors hover:text-gold">
              <Share2 size={17} strokeWidth={1.4} />
            </button>
            <div className="relative group">
              <button aria-label="Play slideshow" onClick={onSlideshow} className="transition-colors hover:text-gold">
                <Play size={17} strokeWidth={1.4} />
              </button>
              <span className="pointer-events-none absolute -bottom-7 right-0 whitespace-nowrap rounded bg-ink px-2 py-1 font-sans text-[0.55rem] text-white opacity-0 transition-opacity group-hover:opacity-100">
                Slideshow
              </span>
            </div>
          </div>

        </div>

        {/* Mobile: Stacked layout */}
        <div className="sm:hidden">
          {/* Row 1: Title + Studio Name */}
          <div className="mb-4 text-left">
            <h2 className="m-0 font-display text-lg font-light uppercase tracking-[0.08em] text-ink">
              {renderTitle(title)}
            </h2>
            {studioName && (
              <p className="m-0 mt-0.5 text-[0.55rem] font-medium uppercase tracking-[0.3em] text-gold">
                {studioName}
              </p>
            )}
          </div>

          {/* Row 2: Horizontally scrollable album tabs */}
          {albums.length > 0 && (
            <div className="flex items-center justify-between gap-2">
              {/* Scrollable categories */}
              <nav className="flex-1 overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 pb-1">
                  {albums.map((album) => (
                    <button
                      key={album.id}
                      onClick={() => onSelect(album.id)}
                      className={tabClass(album.id)}
                    >
                      {album.albumName}
                    </button>
                  ))}
                </div>
              </nav>

              {/* Controls — compact for mobile */}
              <div className="flex shrink-0 items-center gap-2 text-ink/70 ml-2 -mr-2">
                <button aria-label="Download album" onClick={onDownload} className="transition-colors hover:text-gold p-2">
                  <Download size={15} strokeWidth={1.4} />
                </button>
                <button aria-label="Share album" onClick={onShare} className="transition-colors hover:text-gold p-2">
                  <Share2 size={15} strokeWidth={1.4} />
                </button>
                <button aria-label="Play slideshow" onClick={onSlideshow} className="transition-colors hover:text-gold p-2">
                  <Play size={15} strokeWidth={1.4} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
