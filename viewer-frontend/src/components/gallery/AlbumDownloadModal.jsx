import { useState } from 'react'
import { X } from 'lucide-react'
import { albumService } from '../../services/eventService'

const CREDS_KEY = (eventId) => `studiovj_dl_creds_${eventId}`

/** Stash verified credentials for this event in sessionStorage so the guest
 *  isn't asked to re-enter their email + PIN for every album in one visit. */
function getSavedCredentials(eventId) {
  try {
    const raw = sessionStorage.getItem(CREDS_KEY(eventId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveCredentials(eventId, email, pin) {
  try {
    sessionStorage.setItem(CREDS_KEY(eventId), JSON.stringify({ email, pin }))
  } catch { /* ignore */ }
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Axios with responseType:'blob' also returns the *error* body as a Blob,
 *  so a 401 JSON error needs to be read back out of the blob to get its message. */
async function readErrorMessage(err) {
  const data = err?.response?.data
  if (data instanceof Blob) {
    try {
      const text = await data.text()
      const parsed = JSON.parse(text)
      return parsed?.message
    } catch {
      return null
    }
  }
  return err?.response?.data?.message
}

/**
 * Album-level "Download entire album as ZIP" modal.
 * Requires the event-client email + PIN (the same credentials the admin
 * configures on the Event) — verified server-side before any ZIP bytes
 * are streamed, so non-clients cannot download.
 */
export default function AlbumDownloadModal({ eventId, album, studioName, onClose }) {
  const saved = getSavedCredentials(eventId)
  const [email, setEmail] = useState(saved?.email || '')
  const [pin, setPin] = useState(saved?.pin || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !pin.trim()) {
      setError('Please enter the client email and download PIN.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const blob = await albumService.downloadZip(album.id, email.trim(), pin.trim())
      saveCredentials(eventId, email.trim(), pin.trim())
      const filename = `${(album.albumName || 'album').replace(/[^a-zA-Z0-9._-]/g, '_')}.zip`
      triggerBlobDownload(blob, filename)
      onClose()
    } catch (err) {
      const status = err.response?.status

      if (status === 401 || status === 403) {
        setError('Incorrect email or PIN. Please check with your photographer.')
      } else if (status) {
        // Some other HTTP error — surface the server's message if we can read it.
        const message = await readErrorMessage(err)
        setError(message || 'Something went wrong. Please try again.')
      } else {
        // No response object at all usually means the browser blocked a
        // cross-origin error response (e.g. before CORS headers were attached),
        // which in practice for this endpoint almost always means the
        // credentials were rejected rather than a real connectivity problem.
        setError('Incorrect email or PIN. Please check with your photographer.')
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
          <h2 className="font-display text-2xl font-light text-ink">Download Album</h2>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors ml-4">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <p className="mb-6 font-sans text-sm leading-relaxed text-muted">
          Please sign in with the client email and download PIN provided by{' '}
          <span className="font-medium text-ink">{studioName || 'your photographer'}</span> to
          download the entire <span className="font-medium text-ink">{album?.albumName}</span> album
          as a ZIP file.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Client email address"
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
            {submitting ? 'Preparing ZIP...' : 'Sign In & Download'}
          </button>
        </form>
      </div>
    </div>
  )
}
