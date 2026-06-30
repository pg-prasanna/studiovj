import React, { useState, useEffect, useCallback } from 'react'
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  ExternalLink,
  Trash2,
  Crop,
} from 'lucide-react'
import { cn } from '../../utils/helpers'

export const Lightbox = ({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  onDelete,
  onDownload,
  onCrop,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(100)
  const [, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)

  // initialIndex is only used as the seed for useState above, so if the
  // lightbox is already mounted and the user clicks a *different* photo,
  // currentIndex would otherwise stay stuck on whatever it was before —
  // this is what caused "View" to sometimes show the wrong photo.
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setZoom(100)
    }
  }, [isOpen, initialIndex])

  const currentPhoto = photos?.[currentIndex]

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
    setZoom(100)
  }, [photos?.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
    setZoom(100)
  }, [photos?.length])

  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') onClose()
      if (e.key === '+') setZoom((prev) => Math.min(prev + 10, 200))
      if (e.key === '-') setZoom((prev) => Math.max(prev - 10, 100))
    },
    [isOpen, goToPrevious, goToNext, onClose]
  )

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  const handleMouseDown = (e) => {
    if (zoom <= 100) return
    setIsDragging(true)
    setDragStart(e.clientX)
  }

  const handleTouchStart = (e) => {
    setDragStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    const touchEnd = e.changedTouches[0].clientX
    const diff = dragStart - touchEnd
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext()
      else goToPrevious()
    }
  }

  if (!isOpen || !currentPhoto) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors p-2 z-10"
        title="Close (ESC)"
      >
        <X size={32} />
      </button>

      {/* Photo Counter */}
      <div className="absolute top-4 left-4 text-white text-sm font-medium">
        {currentIndex + 1} / {photos.length}
      </div>

      {/* Main Image Container */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentPhoto.imageUrl}
          alt={`Photo ${currentIndex + 1}`}
          className={cn(
            'max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-200 select-none',
            zoom > 100 ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
          )}
          style={{
            transform: `scale(${zoom / 100})`,
          }}
          onDragStart={(e) => e.preventDefault()}
        />
      </div>

      {/* Controls Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black to-transparent p-6 text-white">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {/* Left Controls */}
          <div className="flex gap-2">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Previous (←)"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Next (→)"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Center Zoom Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setZoom((prev) => Math.max(prev - 10, 100))}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
              disabled={zoom <= 100}
              title="Zoom Out (-)"
            >
              <ZoomOut size={20} />
            </button>
            <span className="text-sm font-medium min-w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom((prev) => Math.min(prev + 10, 200))}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors disabled:opacity-50"
              disabled={zoom >= 200}
              title="Zoom In (+)"
            >
              <ZoomIn size={20} />
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex gap-2">
            <a
              href={currentPhoto.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors flex items-center gap-1 text-sm"
              title="View full size"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={20} />
            </a>
            {onCrop && (
              <button
                onClick={() => onCrop(currentPhoto)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                title="Crop"
              >
                <Crop size={20} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(currentPhoto.id)}
                className="p-2 hover:bg-red-500 hover:bg-opacity-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors hidden md:block"
            title="Previous (←)"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors hidden md:block"
            title="Next (→)"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}


    </div>
  )
}
