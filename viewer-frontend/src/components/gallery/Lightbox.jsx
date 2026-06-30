import { useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Lightbox({ photos, index, onClose, onNavigate }) {
  const photo = photos[index]
  const touchStartRef = useRef({ x: 0, y: 0 })
  const touchEndRef = useRef({ x: 0, y: 0 })

  const goPrev = useCallback(
    () => onNavigate((index - 1 + photos.length) % photos.length),
    [index, photos.length, onNavigate]
  )
  const goNext = useCallback(
    () => onNavigate((index + 1) % photos.length),
    [index, photos.length, onNavigate]
  )

  // Minimum swipe distance to trigger navigation (50px)
  const minSwipeDistance = 50

  const handleTouchStart = (e) => {
    touchStartRef.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }
  }

  const handleTouchEnd = (e) => {
    touchEndRef.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
    }
    handleSwipe()
  }

  const handleSwipe = () => {
    const xDiff = touchStartRef.current.x - touchEndRef.current.x
    const yDiff = Math.abs(touchStartRef.current.y - touchEndRef.current.y)

    // Check if swipe is horizontal (not vertical scroll)
    if (Math.abs(xDiff) > yDiff) {
      if (Math.abs(xDiff) > minSwipeDistance) {
        if (xDiff > 0) {
          // Swiped left → Next image
          goNext()
        } else {
          // Swiped right → Previous image
          goPrev()
        }
      }
    }
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [goPrev, goNext, onClose])

  if (!photo) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-white px-2"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute right-4 top-4 text-ink/60 transition-colors hover:text-ink sm:right-8 sm:top-8"
      >
        <X size={26} strokeWidth={1.4} />
      </button>

      <button
        aria-label="Previous photo"
        onClick={(e) => { e.stopPropagation(); goPrev() }}
        className="absolute left-2 text-ink/50 transition-colors hover:text-ink sm:left-6"
      >
        <ChevronLeft size={32} strokeWidth={1.2} />
      </button>

      <img
        src={photo.imageUrl}
        alt="Selected"
        className="max-h-[90vh] max-w-[92vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />

      <button
        aria-label="Next photo"
        onClick={(e) => { e.stopPropagation(); goNext() }}
        className="absolute right-2 text-ink/50 transition-colors hover:text-ink sm:right-6"
      >
        <ChevronRight size={32} strokeWidth={1.2} />
      </button>

      <p className="absolute bottom-6 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ink/40">
        {index + 1} / {photos.length}
      </p>
    </div>
  )
}
