import { useState } from 'react'
import { X } from 'lucide-react'
import { eventService } from '../../services/eventService'

const SESSION_KEY = (eventId) => `studiovj_dl_access_${eventId}`

export function hasDownloadAccess(eventId) {
  try {
    return sessionStorage.getItem(SESSION_KEY(eventId)) === 'granted'
  } catch {
    return false
  }
}

function grantDownloadAccess(eventId) {
  try {
    sessionStorage.setItem(SESSION_KEY(eventId), 'granted')
  } catch { /* ignore */ }
}

async function triggerDownload(imageUrl, filename) {
  try {
    const res = await fetch(imageUrl)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'photo.jpg'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    // Fallback: open in new tab if fetch fails (CORS etc)
    window.open(imageUrl, '_blank')
  }
}

export default function DownloadModal({ eventId, photo, studioName, onClose }) {
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !pin.trim()) {
      setError('Please enter your email and download PIN.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await eventService.verifyDownload(eventId, email.trim(), pin.trim())
      grantDownloadAccess(eventId)
      onClose()
      const filename = `photo-${photo.id || Date.now()}.jpg`
      triggerDownload(photo.imageUrl, filename)
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Incorrect email or PIN. Please check with your photographer.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <h2 className="font-display text-2xl font-light text-ink">Download Photo</h2>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors ml-4">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <p className="mb-6 font-sans text-sm leading-relaxed text-muted">
          Please enter your email and the download PIN provided by{' '}
          <span className="font-medium text-ink">{studioName || 'your photographer'}</span> to
          download this photo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            autoComplete="email"
            className="w-full border border-hairline px-4 py-3 font-sans text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
          />
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter download PIN"
            className="w-full border border-hairline px-4 py-3 font-sans text-sm text-ink placeholder:text-muted focus:border-gold focus:outline-none"
          />

          {error && (
            <p className="text-xs font-sans text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-ink py-3 font-sans text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink/80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Verifying...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
