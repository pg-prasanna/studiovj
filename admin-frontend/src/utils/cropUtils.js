// Canvas-based crop/rotate/flip helpers — no external deps.
// Works on both local Files (pre-upload queue) and remote image URLs
// (editing an already-uploaded gallery photo).

// Fixed aspect ratio every event cover image is cropped to. Kept constant
// so every cover renders identically (no stretching/cropping surprises)
// wherever it's displayed on the public site (hero banners, gallery
// cards, etc). 3:2 mirrors standard DSLR/wedding-photography framing.
export const COVER_ASPECT_RATIO = 3 / 2
export const COVER_ASPECT_LABEL = '3:2'

export const ASPECT_PRESETS = [
  { id: 'free', label: 'Free', ratio: null },
  { id: 'original', label: 'Original', ratio: 'original' },
  { id: 'square', label: '1:1', ratio: 1 },
  { id: 'portrait', label: '4:5', ratio: 4 / 5 },
  { id: 'landscape', label: '16:9', ratio: 16 / 9 },
  { id: 'classic', label: '4:3', ratio: 4 / 3 },
]

// Loads an image from a File/Blob or a remote URL. Remote URLs are
// fetched with crossOrigin so the canvas isn't tainted (Cloudinary
// sends permissive CORS headers; if a future host doesn't, export
// will throw and the caller should fall back to "view only").
export const loadImageSource = (source) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    if (typeof source === 'string') {
      img.crossOrigin = 'anonymous'
      img.src = source
    } else {
      img.src = URL.createObjectURL(source)
    }
  })
}

// crop: { x, y, width, height } in source-image pixel space
// rotation: degrees, multiple of 90 (0/90/180/270)
// flipH/flipV: booleans
export const renderCrop = ({ image, crop, rotation = 0, flipH = false, flipV = false, mimeType = 'image/jpeg', quality = 0.92 }) => {
  const swap = rotation === 90 || rotation === 270
  const outW = swap ? crop.height : crop.width
  const outH = swap ? crop.width : crop.height

  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(outW))
  canvas.height = Math.max(1, Math.round(outH))
  const ctx = canvas.getContext('2d')

  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    swap ? -crop.height / 2 : -crop.width / 2,
    swap ? -crop.width / 2 : -crop.height / 2,
    crop.width,
    crop.height
  )
  ctx.restore()

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Export failed'))),
      mimeType,
      quality
    )
  })
}

// Convenience: produce a File ready to drop back into an upload queue
// or send to the server, preserving the original filename.
export const cropToFile = async (opts, filename, mimeType = 'image/jpeg') => {
  const blob = await renderCrop({ ...opts, mimeType })
  return new File([blob], filename, { type: mimeType })
}

export const clampCropToBounds = (crop, boundsW, boundsH) => {
  const x = Math.max(0, Math.min(crop.x, boundsW - 1))
  const y = Math.max(0, Math.min(crop.y, boundsH - 1))
  const width = Math.max(1, Math.min(crop.width, boundsW - x))
  const height = Math.max(1, Math.min(crop.height, boundsH - y))
  return { x, y, width, height }
}
