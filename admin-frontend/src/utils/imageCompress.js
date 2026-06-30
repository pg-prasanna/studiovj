/**
 * Frontend image compression — mirrors the exact logic in CloudinaryService.java.
 *
 * Rules (same as backend):
 *   - file ≤ 10 MB  → original bytes unchanged
 *   - file > 10 MB  → try JPEG quality 90 %, then 85 %, then resize (4000 px), then resize (3000 px)
 *   - resize: longest side capped, bicubic, never upscale, then JPEG 85 %
 *   - throws if still > 10 MB after all attempts
 */

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality)
  })
}

async function compressJpeg(blob, quality) {
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)
    return await canvasToBlob(canvas, quality)
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function resizeAndCompress(blob, maxDimension) {
  const url = URL.createObjectURL(blob)
  try {
    const img = await loadImage(url)
    const origW = img.naturalWidth
    const origH = img.naturalHeight
    const scale = maxDimension / Math.max(origW, origH)
    // Never upscale
    const newW = scale >= 1.0 ? origW : Math.round(origW * scale)
    const newH = scale >= 1.0 ? origH : Math.round(origH * scale)

    const canvas = document.createElement('canvas')
    canvas.width = newW
    canvas.height = newH
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, newW, newH)
    ctx.drawImage(img, 0, 0, newW, newH)
    return await canvasToBlob(canvas, 0.85)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Returns a File ready for upload, compressed if needed.
 * Mirrors CloudinaryService.prepareBytes exactly.
 */
export async function prepareFileForUpload(file) {
  if (file.size <= MAX_BYTES) {
    return file
  }

  const originalBlob = file

  // Step 1 — quality 90 %
  let attempt = await compressJpeg(originalBlob, 0.9)
  if (attempt && attempt.size <= MAX_BYTES) {
    return new File([attempt], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
  }

  // Step 2 — quality 85 %
  attempt = await compressJpeg(originalBlob, 0.85)
  if (attempt && attempt.size <= MAX_BYTES) {
    return new File([attempt], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
  }

  // Step 3 — resize 4000 px + quality 85 %
  attempt = await resizeAndCompress(originalBlob, 4000)
  if (attempt && attempt.size <= MAX_BYTES) {
    return new File([attempt], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
  }

  // Step 4 — resize 3000 px + quality 85 %
  attempt = await resizeAndCompress(originalBlob, 3000)
  if (attempt && attempt.size <= MAX_BYTES) {
    return new File([attempt], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
  }

  throw new Error(
    `Image '${file.name}' could not be compressed below 10 MB. Please resize the image manually before uploading.`
  )
}

/**
 * Processes an array of Files, compressing as needed.
 * Returns array of { file, error } — errors are non-fatal per-file.
 */
export async function prepareFilesForUpload(files) {
  return Promise.all(
    files.map(async (f) => {
      try {
        const prepared = await prepareFileForUpload(f)
        return { file: prepared, error: null }
      } catch (err) {
        return { file: f, error: err.message }
      }
    })
  )
}
