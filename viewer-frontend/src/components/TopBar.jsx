import { useState, useEffect, useRef } from 'react'
import { Search, X, Instagram } from 'lucide-react'
import { useSettings } from '../hooks/useEvents'

/**
 * Sticky top bar — always visible at the top of the page.
 * Instagram icon (left) + Search input (right).
 * Search filters the main gallery in-place without opening an overlay.
 */
export default function TopBar({ events = [], onFilter }) {
  const { settings } = useSettings()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const instagramUrl = settings?.instagram
    ? settings.instagram.startsWith('http')
      ? settings.instagram
      : 'https://instagram.com/' + settings.instagram.replace(/^@/, '')
    : null

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [searchOpen])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleQuery = (val) => {
    setQuery(val)
    const q = val.trim().toLowerCase()
    if (!q) { onFilter(null); return }

    const results = events.filter((ev) => {
      const dateStr = ev.eventDate
        ? new Date(ev.eventDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }).toLowerCase()
        : ''
      const dateShort = ev.eventDate
        ? new Date(ev.eventDate).toLocaleDateString('en-IN').toLowerCase()
        : ''
      const year = ev.eventDate ? String(new Date(ev.eventDate).getFullYear()) : ''

      return (
        (ev.title || '').toLowerCase().includes(q) ||
        (ev.categoryName || '').toLowerCase().includes(q) ||
        (ev.location || '').toLowerCase().includes(q) ||
        dateStr.includes(q) ||
        dateShort.includes(q) ||
        year.includes(q) ||
        (ev.description || '').toLowerCase().includes(q)
      )
    })
    onFilter(results)
  }

  const closeSearch = () => {
    setSearchOpen(false)
    setQuery('')
    onFilter(null)
  }

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between px-5 py-3 sm:px-8">
        {/* Instagram */}
        {instagramUrl ? (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:text-gold"
          >
            <Instagram size={20} strokeWidth={1.5} />
          </a>
        ) : (
          <div className="h-9 w-9" />
        )}

        {/* Search area */}
        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="flex items-center gap-2 border-b border-gold">
              <Search size={16} strokeWidth={1.4} className="shrink-0 text-gold" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQuery(e.target.value)}
                placeholder="Search by name, date, category..."
                className="w-48 sm:w-72 bg-transparent font-sans text-[0.82rem] text-ink placeholder-muted outline-none py-1"
              />
              {query && (
                <span className="font-sans text-[0.7rem] text-muted pr-1">
                  {events.filter((ev) => {
                    const q = query.trim().toLowerCase()
                    const dateStr = ev.eventDate
                      ? new Date(ev.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase()
                      : ''
                    const year = ev.eventDate ? String(new Date(ev.eventDate).getFullYear()) : ''
                    return (
                      (ev.title || '').toLowerCase().includes(q) ||
                      (ev.categoryName || '').toLowerCase().includes(q) ||
                      (ev.location || '').toLowerCase().includes(q) ||
                      dateStr.includes(q) ||
                      year.includes(q) ||
                      (ev.description || '').toLowerCase().includes(q)
                    )
                  }).length} result(s)
                </span>
              )}
              <button
                aria-label="Close search"
                onClick={closeSearch}
                className="shrink-0 text-ink/50 transition-colors hover:text-ink ml-1"
              >
                <X size={18} strokeWidth={1.4} />
              </button>
            </div>
          ) : (
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 transition-colors hover:text-gold"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
