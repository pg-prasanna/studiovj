import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

const INTERVAL_MS = 4000

export default function Slideshow({ photos, onClose }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [fade, setFade] = useState(true)
  const timerRef = useRef(null)

  const goTo = useCallback((nextIdx) => {
    setFade(false)
    setTimeout(() => {
      setIndex(nextIdx)
      setFade(true)
    }, 200)
  }, [])

  const goPrev = useCallback(() => {
    goTo((index - 1 + photos.length) % photos.length)
  }, [index, photos.length, goTo])

  const goNext = useCallback(() => {
    goTo((index + 1) % photos.length)
  }, [index, photos.length, goTo])

  useEffect(() => {
    if (!playing) { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(goNext, INTERVAL_MS)
    return () => clearInterval(timerRef.current)
  }, [playing, goNext])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p) }
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [goPrev, goNext, onClose])

  const photo = photos[index]
  if (!photo) return null

  return (
    <div className="fixed inset-0 z-[55] flex flex-col bg-white">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 pt-6">
        <span className="font-sans text-[0.65rem] uppercase tracking-[0.2em] text-ink/40">
          {index + 1} / {photos.length}
        </span>
        <button
          aria-label="Close slideshow"
          onClick={onClose}
          className="text-ink/50 hover:text-ink transition-colors"
        >
          <X size={24} strokeWidth={1.4} />
        </button>
      </div>

      {/* Image */}
      <div className="flex flex-1 items-center justify-center px-16 overflow-hidden">
        <img
          key={photo.id ?? index}
          src={photo.imageUrl}
          alt={"Slide " + (index + 1)}
          className="max-h-[85vh] max-w-full object-contain transition-opacity duration-300"
          style={{ opacity: fade ? 1 : 0 }}
        />
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink/10">
        {playing && (
          <div
            key={index + "-playing"}
            className="h-full bg-gold"
            style={{ animation: "slideshow-progress " + INTERVAL_MS + "ms linear forwards" }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-6">
        <button
          aria-label="Previous"
          onClick={goPrev}
          className="text-ink/50 hover:text-ink transition-colors"
        >
          <ChevronLeft size={32} strokeWidth={1.2} />
        </button>

        <button
          aria-label={playing ? 'Pause' : 'Play'}
          onClick={() => setPlaying((p) => !p)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 text-ink/60 hover:border-ink hover:text-ink transition-colors"
        >
          {playing ? <Pause size={16} strokeWidth={1.5} /> : <Play size={16} strokeWidth={1.5} />}
        </button>

        <button
          aria-label="Next"
          onClick={goNext}
          className="text-ink/50 hover:text-ink transition-colors"
        >
          <ChevronRight size={32} strokeWidth={1.2} />
        </button>
      </div>

      {/* Progress dots */}
      {photos.length <= 20 && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-1.5">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={"h-1 rounded-full transition-all " + (i === index ? 'w-5 bg-gold' : 'w-1.5 bg-ink/20 hover:bg-ink/40')}
            />
          ))}
        </div>
      )}

      <style>{"@keyframes slideshow-progress { from { width: 0% } to { width: 100% } }"}</style>
    </div>
  )
}
