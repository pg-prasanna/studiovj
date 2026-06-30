import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  X,
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  Loader,
  Trash2,
  ExternalLink,
  Lock,
} from 'lucide-react'
import { ASPECT_PRESETS, loadImageSource, renderCrop, clampCropToBounds } from '../../utils/cropUtils'
import { ORIENTATIONS } from '../../utils/helpers'

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

/**
 * CropModal — the single, unified "edit photo" surface used in three places:
 *  1. UploadManager: cropping a File before it's uploaded.
 *  2. CoverImageUpload: cropping an event cover to a fixed aspect ratio.
 *  3. PhotoUploadPage gallery: editing an already-uploaded photo — crop,
 *     set orientation, or delete — all from one screen instead of a
 *     separate badge + kebab menu on every card.
 *
 * Props:
 *  - source: File | string (image url)
 *  - filename: string used for the exported file / shown as subtitle
 *  - isOpen, onClose
 *  - onSave(blob, meta): meta = { width, height }
 *  - isSaving: bool — show spinner / disable controls while parent uploads
 *  - lockedAspect: number | null — when set, the aspect ratio is fixed,
 *    the preset picker is hidden, and a small "locked" indicator is shown
 *  - title: header title (defaults to "Crop photo")
 *  - orientation / onOrientationChange: optional — show an orientation
 *    selector in the footer (gallery-edit flow only)
 *  - onDelete: optional — show a destructive "Delete photo" action
 */
export const CropModal = ({
  source,
  filename = 'photo.jpg',
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  lockedAspect = null,
  title = 'Crop photo',
  orientation,
  onOrientationChange,
  onDelete,
}) => {
  const [image, setImage] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 })
  const [crop, setCrop] = useState(null) // in source-pixel space
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [presetId, setPresetId] = useState(lockedAspect ? 'locked' : 'original')
  const [drag, setDrag] = useState(null) // { mode: 'move'|'nw'|'n'|..., startX, startY, startCrop }

  const stageRef = useRef(null)
  const [stageRect, setStageRect] = useState({ width: 0, height: 0 })

  const presets = lockedAspect
    ? [{ id: 'locked', label: 'Fixed', ratio: lockedAspect }]
    : ASPECT_PRESETS

  // Reset everything whenever a new source is opened
  useEffect(() => {
    if (!isOpen || !source) return
    let cancelled = false
    setImage(null)
    setLoadError(null)
    setRotation(0)
    setFlipH(false)
    setFlipV(false)
    setPresetId(lockedAspect ? 'locked' : 'original')

    loadImageSource(source)
      .then((img) => {
        if (cancelled) return
        setImage(img)
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
        setCrop({ x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight })
      })
      .catch((err) => !cancelled && setLoadError(err.message))

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, source])

  // Revoke the object URL created for File-based sources once the image
  // is replaced or the modal closes, so repeated crop sessions don't leak.
  useEffect(() => {
    if (!image) return
    const src = image.src
    return () => {
      if (src.startsWith('blob:')) URL.revokeObjectURL(src)
    }
  }, [image])

  // Track stage size for screen<->image coordinate conversion
  useEffect(() => {
    if (!isOpen) return
    const el = stageRef.current
    if (!el) return
    const update = () => setStageRect({ width: el.clientWidth, height: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [isOpen, image])

  const swap = rotation === 90 || rotation === 270
  const displayW = swap ? naturalSize.h : naturalSize.w
  const displayH = swap ? naturalSize.w : naturalSize.h

  // Scale factor from "display" (post-rotation) pixel space to on-screen px
  const scale = useMemo(() => {
    if (!displayW || !displayH || !stageRect.width) return 1
    return Math.min(stageRect.width / displayW, stageRect.height / displayH)
  }, [displayW, displayH, stageRect])

  const offset = useMemo(() => {
    const w = displayW * scale
    const h = displayH * scale
    return { x: (stageRect.width - w) / 2, y: (stageRect.height - h) / 2, w, h }
  }, [displayW, displayH, scale, stageRect])

  // Convert a crop box (in display/post-rotation space) to screen rect
  const cropToScreen = useCallback(
    (c) => ({
      left: offset.x + c.x * scale,
      top: offset.y + c.y * scale,
      width: c.width * scale,
      height: c.height * scale,
    }),
    [offset, scale]
  )

  // crop state is stored in *source* pixel space (pre-rotation) to keep
  // export math simple; convert to display space for rendering the box.
  const cropDisplay = useMemo(() => {
    if (!crop) return null
    if (!swap) return crop
    return { x: crop.y, y: crop.x, width: crop.height, height: crop.width }
  }, [crop, swap])

  const setCropFromDisplay = useCallback(
    (d) => {
      const next = swap ? { x: d.y, y: d.x, width: d.height, height: d.width } : d
      setCrop(clampCropToBounds(next, naturalSize.w, naturalSize.h))
    },
    [swap, naturalSize]
  )

  const applyPreset = useCallback(
    (preset) => {
      setPresetId(preset.id)
      if (!naturalSize.w) return
      const ratio = preset.ratio === 'original' ? naturalSize.w / naturalSize.h : preset.ratio
      if (ratio == null) return // free — keep current box
      const dW = swap ? naturalSize.h : naturalSize.w
      const dH = swap ? naturalSize.w : naturalSize.h
      let w = dW
      let h = w / ratio
      if (h > dH) {
        h = dH
        w = h * ratio
      }
      setCropFromDisplay({ x: (dW - w) / 2, y: (dH - h) / 2, width: w, height: h })
    },
    [naturalSize, swap, setCropFromDisplay]
  )

  // Apply the locked aspect ratio as soon as the image loads
  useEffect(() => {
    if (!lockedAspect || !naturalSize.w) return
    applyPreset({ id: 'locked', ratio: lockedAspect })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedAspect, naturalSize.w])

  // Re-apply the active aspect ratio after a rotation flips dimensions
  useEffect(() => {
    if (!naturalSize.w) return
    const preset = presets.find((p) => p.id === presetId)
    if (preset && preset.ratio !== null) applyPreset(preset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation])

  const startDrag = (mode) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    const point = e.touches ? e.touches[0] : e
    setDrag({ mode, startX: point.clientX, startY: point.clientY, startCrop: cropDisplay })
  }

  useEffect(() => {
    if (!drag) return
    const dW = swap ? naturalSize.h : naturalSize.w
    const dH = swap ? naturalSize.w : naturalSize.h
    const preset = presets.find((p) => p.id === presetId)
    const lockedRatio = preset && preset.ratio !== null ? (preset.ratio === 'original' ? naturalSize.w / naturalSize.h : preset.ratio) : null

    const onMove = (e) => {
      const point = e.touches ? e.touches[0] : e
      const dx = (point.clientX - drag.startX) / scale
      const dy = (point.clientY - drag.startY) / scale
      let { x, y, width, height } = drag.startCrop

      if (drag.mode === 'move') {
        x += dx
        y += dy
      } else {
        if (drag.mode.includes('e')) width += dx
        if (drag.mode.includes('s')) height += dy
        if (drag.mode.includes('w')) {
          width -= dx
          x += dx
        }
        if (drag.mode.includes('n')) {
          height -= dy
          y += dy
        }
        if (lockedRatio) {
          // keep ratio anchored at the opposite edge/corner
          if (drag.mode.length === 1) {
            // single-edge handle: derive the other dimension
            if (drag.mode === 'e' || drag.mode === 'w') height = width / lockedRatio
            else width = height * lockedRatio
            if (drag.mode === 'w') x = drag.startCrop.x + drag.startCrop.width - width
            if (drag.mode === 'n') y = drag.startCrop.y + drag.startCrop.height - height
          } else {
            height = width / lockedRatio
            if (drag.mode.includes('n')) y = drag.startCrop.y + drag.startCrop.height - height
          }
        }
      }

      width = Math.max(20, width)
      height = Math.max(20, height)
      x = Math.max(0, Math.min(x, dW - width))
      y = Math.max(0, Math.min(y, dH - height))
      width = Math.min(width, dW - x)
      height = Math.min(height, dH - y)

      setCropFromDisplay({ x, y, width, height })
    }
    const onUp = () => setDrag(null)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [drag, scale, swap, naturalSize, presetId, presets, setCropFromDisplay])

  const [saving, setSaving] = useState(false)
  const handleSave = async () => {
    if (!image || !crop) return
    try {
      setSaving(true)
      const blob = await renderCrop({ image, crop, rotation, flipH, flipV })
      const outW = swap ? crop.height : crop.width
      const outH = swap ? crop.width : crop.height
      await onSave(blob, { width: Math.round(outW), height: Math.round(outH) })
    } catch (err) {
      setLoadError(err.message || 'Could not export crop')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  const screenCrop = cropDisplay ? cropToScreen(cropDisplay) : null
  const busy = isSaving || saving
  const showOrientation = typeof orientation !== 'undefined' && onOrientationChange

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#0b0d12] flex flex-col animate-fade-in"
      style={{ backgroundColor: '#0b0d12' }}
    >
      {/* Top bar — full-width, fixed height, no floating/overlapping elements */}
      <div
        className="flex-shrink-0 flex items-center justify-between gap-4 px-5 h-16 bg-[#14171d] backdrop-blur border-b border-white/10 shadow-sm"
        style={{ backgroundColor: '#14171d' }}
      >
        <div className="min-w-0">
          <h3 className="font-semibold text-white text-base leading-tight truncate">{title}</h3>
          {filename && (
            <p className="text-xs text-white/50 truncate mt-0.5">{filename}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {typeof source === 'string' && (
            <a
              href={source}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Open original in new tab"
            >
              <ExternalLink size={14} />
              Full size
            </a>
          )}
          <button
            onClick={onClose}
            disabled={busy}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className="relative flex-1 min-h-0 overflow-hidden select-none bg-[#0b0d12]"
        style={{ backgroundColor: '#0b0d12' }}
      >
        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center text-red-300 text-sm px-6 text-center">
            {loadError}
          </div>
        )}
        {!image && !loadError && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            <Loader size={28} className="animate-spin" />
          </div>
        )}
        {image && (
          <div
            className="absolute"
            style={{
              left: offset.x,
              top: offset.y,
              width: offset.w,
              height: offset.h,
              transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
              transformOrigin: 'center',
            }}
          >
            <img
              src={image.src}
              alt="Crop preview"
              className="w-full h-full object-fill pointer-events-none"
              draggable={false}
            />
          </div>
        )}

        {/* Dark mask + crop window */}
        {image && screenCrop && (
          <>
            <div className="absolute inset-0 bg-black/60 pointer-events-none" />
            <div
              className="absolute cursor-move ring-2 ring-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
              style={{ left: screenCrop.left, top: screenCrop.top, width: screenCrop.width, height: screenCrop.height }}
              onMouseDown={startDrag('move')}
              onTouchStart={startDrag('move')}
            >
              {/* Rule-of-thirds grid */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-60">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/30" />
                ))}
              </div>

              {/* Handles */}
              {HANDLES.map((h) => {
                const isCorner = h.length === 2
                const posStyle = {
                  nw: { left: -6, top: -6, cursor: 'nwse-resize' },
                  n: { left: '50%', top: -6, marginLeft: -6, cursor: 'ns-resize' },
                  ne: { right: -6, top: -6, cursor: 'nesw-resize' },
                  e: { right: -6, top: '50%', marginTop: -6, cursor: 'ew-resize' },
                  se: { right: -6, bottom: -6, cursor: 'nwse-resize' },
                  s: { left: '50%', bottom: -6, marginLeft: -6, cursor: 'ns-resize' },
                  sw: { left: -6, bottom: -6, cursor: 'nesw-resize' },
                  w: { left: -6, top: '50%', marginTop: -6, cursor: 'ew-resize' },
                }[h]
                return (
                  <div
                    key={h}
                    onMouseDown={startDrag(h)}
                    onTouchStart={startDrag(h)}
                    className={`absolute bg-white ${isCorner ? 'w-3.5 h-3.5 rounded-sm' : 'w-3 h-3 rounded-full'} shadow border border-gray-400`}
                    style={posStyle}
                  />
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div
        className="flex-shrink-0 bg-[#14171d] backdrop-blur border-t border-white/10 px-5 py-4 space-y-4"
        style={{ backgroundColor: '#14171d' }}
      >
        {/* Aspect presets */}
        {lockedAspect ? (
          <div className="flex items-center gap-2 text-xs font-medium text-white/60">
            <Lock size={13} />
            Fixed aspect ratio — every cover image is cropped the same way for a consistent look
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {presets.map((p) => (
              <button
                key={p.id}
                onClick={() => applyPreset(p)}
                disabled={busy}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                  presetId === p.id ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Rotate / flip */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setRotation((r) => (r + 270) % 360)} disabled={busy}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50" title="Rotate left">
              <RotateCcw size={18} />
            </button>
            <button onClick={() => setRotation((r) => (r + 90) % 360)} disabled={busy}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50" title="Rotate right">
              <RotateCw size={18} />
            </button>
            <button onClick={() => setFlipH((f) => !f)} disabled={busy}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${flipH ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/10'}`} title="Flip horizontal">
              <FlipHorizontal size={18} />
            </button>
            <button onClick={() => setFlipV((f) => !f)} disabled={busy}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${flipV ? 'bg-blue-600 text-white' : 'text-white hover:bg-white/10'}`} title="Flip vertical">
              <FlipVertical size={18} />
            </button>

            {showOrientation && (
              <div className="ml-2 pl-3 border-l border-white/10 flex items-center gap-2">
                <label className="text-xs text-white/50 hidden sm:block">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => onOrientationChange(e.target.value)}
                  disabled={busy}
                  className="bg-white/10 text-white text-xs font-medium rounded-lg px-2.5 py-2 border border-white/10 outline-none cursor-pointer disabled:opacity-50"
                >
                  {ORIENTATIONS.map((o) => (
                    <option key={o} value={o} className="text-gray-900">
                      {o.charAt(0) + o.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Delete / Save / cancel */}
          <div className="flex items-center gap-2 ml-auto">
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={busy}
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            )}
            <button onClick={onClose} disabled={busy}
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={busy || !image}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
              {busy ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
              {busy ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
