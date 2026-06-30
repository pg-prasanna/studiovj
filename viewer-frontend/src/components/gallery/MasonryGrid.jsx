import PhotoTile from './PhotoTile'

const FALLBACK_RATIO = { PORTRAIT: 3 / 4, LANDSCAPE: 4 / 3, SQUARE: 1 }

export default function MasonryGrid({ photos, albumName, onSelect, onDownload, onShare }) {
  if (!photos || photos.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-sans text-sm text-muted">No photos found in this album.</p>
      </div>
    )
  }

  return (
    <div className="columns-2 gap-1.5 sm:columns-3 sm:gap-1.5 lg:columns-4 lg:gap-1.5">
      {photos
        .slice()
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        .map((photo, index) => {
          const ratio =
            photo.width && photo.height
              ? photo.width / photo.height
              : FALLBACK_RATIO[photo.orientation] || 4 / 3

          return (
            <PhotoTile
              key={photo.id ?? index}
              photo={photo}
              ratio={ratio}
              alt={`${albumName || 'Gallery'} photo ${index + 1}`}
              priority={index < 6}
              onClick={() => onSelect?.(index)}
              onDownload={onDownload}
              onShare={onShare}
            />
          )
        })}
    </div>
  )
}
