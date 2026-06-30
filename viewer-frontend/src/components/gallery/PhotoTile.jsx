import { useState } from 'react'
import { Download, Share2 } from 'lucide-react'

/**
 * Single photo tile in the masonry grid.
 * onDownload / onShare callbacks are fired (with the photo object) so the
 * parent can show the appropriate modal — keeps this component pure UI.
 */
export default function PhotoTile({ photo, ratio, alt, priority = false, onClick, onDownload, onShare }) {
  const [loaded, setLoaded] = useState(false)

  const stop = (e) => e.stopPropagation()

  return (
    <div
      className="group relative mb-1.5 block w-full cursor-pointer overflow-hidden break-inside-avoid bg-cream"
      style={{ aspectRatio: ratio }}
      onClick={onClick}
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-cream" />}

      <img
        src={photo.thumbnailUrl || photo.imageUrl}
        srcSet={
          photo.thumbnailUrl && photo.imageUrl
            ? `${photo.thumbnailUrl} 480w, ${photo.imageUrl} 1200w`
            : undefined
        }
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`block h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02] ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Hover actions */}
      <div className="absolute bottom-2 right-2 flex items-center gap-2 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
        <button
          aria-label="Download photo"
          onClick={(e) => { stop(e); onDownload?.(photo) }}
          className="rounded-none bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <Download size={14} strokeWidth={1.5} />
        </button>
        <button
          aria-label="Share photo"
          onClick={(e) => { stop(e); onShare?.(photo) }}
          className="rounded-none bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <Share2 size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
