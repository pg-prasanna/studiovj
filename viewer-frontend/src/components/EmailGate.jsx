import { useState } from 'react'
import { eventService } from '../services/eventService'

const STORAGE_PREFIX = 'studiovj_gallery_access_'

export function hasGalleryAccess(eventId) {
  try {
    return sessionStorage.getItem(`${STORAGE_PREFIX}${eventId}`) === 'granted'
  } catch {
    return false
  }
}

function grantGalleryAccess(eventId) {
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${eventId}`, 'granted')
  } catch {
    // sessionStorage unavailable - access will simply be re-requested next visit
  }
}

export default function EmailGate({ event, eventId, onUnlock }) {
  const [email, setEmail] = useState('')
  const [subscribe, setSubscribe] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await eventService.trackVisit(eventId, trimmed)
      grantGalleryAccess(eventId)
      onUnlock()
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ink px-5">
      {event?.coverImageUrl && (
        <>
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="absolute left-0 top-0 h-full w-full object-cover object-top opacity-60"
          />
          <div className="absolute left-0 top-0 h-full w-full bg-black/55" />
        </>
      )}

      <div className="relative z-[1] w-full max-w-md text-center">
        <h1 className="m-0 mb-2 font-display text-3xl font-light uppercase tracking-[0.08em] text-white sm:text-4xl">
          {event?.title || 'Private Gallery'}
        </h1>
        <p className="m-0 mb-8 text-[0.7rem] uppercase tracking-[0.3em] text-gold-light">
          Studio VJ
        </p>

        <p className="mb-6 text-sm text-white/80">
          <span className="font-semibold text-white">Guest Access.</span> Enter your
          email to view this collection.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full border border-white/30 bg-white px-5 py-4 font-sans text-base text-ink placeholder:text-muted focus:border-gold focus:outline-none"
          />

          {error && <p className="-mt-2 text-xs text-red-300">{error}</p>}

          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={subscribe}
              onChange={(e) => setSubscribe(e.target.checked)}
              className="h-4 w-4 accent-gold"
            />
            Send me news and promotions from STUDIO VJ.
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="border border-white px-10 py-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-white hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Please wait...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}
