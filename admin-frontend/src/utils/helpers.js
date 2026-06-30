export const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const isValidFile = (file) => {
  const maxSize = 50 * 1024 * 1024 // 50MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']

  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds 50MB limit` }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only image files are allowed (JPG, PNG, GIF, WebP, SVG, BMP)' }
  }

  return { valid: true }
}

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const truncateText = (text, length = 50) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }
  if (error?.response?.data?.details) {
    return error.response.data.details
  }
  if (error?.message) {
    return error.message
  }
  return 'An error occurred. Please try again.'
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const generateId = () => {
  return Math.random().toString(36).substr(2, 9)
}

// Photo Management Utilities
export const getAlbumCoverImage = (photos) => {
  if (!photos || photos.length === 0) return null
  // Return first photo (or could be enhanced to check for user-selected cover)
  return photos[0]?.imageUrl || null
}

export const formatRelativeTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + 'y ago'
  
  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + 'mo ago'
  
  interval = seconds / 604800
  if (interval > 1) return Math.floor(interval) + 'w ago'
  
  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + 'd ago'
  
  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + 'h ago'
  
  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + 'm ago'
  
  return 'Just now'
}

export const calculateImageDimensions = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }
      img.onerror = () => {
        resolve({ width: null, height: null })
      }
      img.src = e.target.result
    }
    reader.onerror = () => resolve({ width: null, height: null })
    reader.readAsDataURL(file)
  })
}

// Orientation detection — mirrors the backend's Orientation.detect logic
// (width/height ratio within 5% of 1:1 is treated as SQUARE).
export const ORIENTATIONS = ['PORTRAIT', 'LANDSCAPE', 'SQUARE']

export const detectOrientation = (width, height) => {
  if (!width || !height) return 'LANDSCAPE'
  const ratio = width / height
  if (Math.abs(ratio - 1) <= 0.05) return 'SQUARE'
  return ratio > 1 ? 'LANDSCAPE' : 'PORTRAIT'
}

// Reads a file's dimensions and returns { width, height, orientation }.
// Used during upload so the admin can preview/override orientation
// before the file is sent to the server.
export const getImageMeta = async (file) => {
  const { width, height } = await calculateImageDimensions(file)
  return { width, height, orientation: detectOrientation(width, height) }
}

export const sortPhotosByDate = (photos, order = 'newest') => {
  const sorted = [...photos].sort((a, b) => {
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return order === 'newest' ? dateB - dateA : dateA - dateB
  })
  return sorted
}

export const filterPhotosByQuery = (photos, query) => {
  if (!query.trim()) return photos
  const lowerQuery = query.toLowerCase()
  return photos.filter((photo) => {
    return (
      photo.imageUrl?.toLowerCase().includes(lowerQuery) ||
      formatDate(photo.createdAt)?.toLowerCase().includes(lowerQuery)
    )
  })
}

export const groupPhotosByDate = (photos) => {
  const groups = {}
  photos.forEach((photo) => {
    const date = formatDate(photo.createdAt)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(photo)
  })
  return groups
}


// ─── Cloudinary Thumbnail Helper ─────────────────────────────────────────────
// Converts any Cloudinary URL to an optimised thumbnail.
// e.g. /upload/v123/folder/image.jpg  →  /upload/w_300,h_300,c_fill,q_auto,f_auto/v123/folder/image.jpg
export const getCloudinaryThumb = (url, { w = 300, h = 300 } = {}) => {
  if (!url) return url
  if (!url.includes('res.cloudinary.com')) return url
  const transformation = `w_${w},h_${h},c_fill,q_auto,f_auto`
  return url.replace('/upload/', `/upload/${transformation}/`)
}
