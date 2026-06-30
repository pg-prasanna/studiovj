import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'

const shareTargets = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: '#25D366',
    getUrl: (url) => `https://wa.me/?text=${encodeURIComponent(url)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
      </svg>
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'twitter',
    label: 'X (Twitter)',
    color: '#000000',
    getUrl: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'Email',
    color: '#6B6B6B',
    getUrl: (url) => `mailto:?subject=Check%20out%20this%20photo&body=${encodeURIComponent(url)}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="26" height="26">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
]

export default function ShareModal({ photo, url, onClose }) {
  const [copied, setCopied] = useState(false)

  const shareUrl = url || photo?.imageUrl || window.location.href

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback select
      const input = document.getElementById('share-url-input')
      if (input) { input.select(); document.execCommand('copy') }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url: shareUrl })
      } catch { /* cancelled */ }
    }
  }

  const openShare = (url) => {
    window.open(url, '_blank', 'noopener,width=600,height=500')
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
          <h2 className="font-display text-2xl font-light text-ink">Share</h2>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors ml-4">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* URL copy bar */}
        <div className="mb-6 flex items-stretch border border-hairline">
          <input
            id="share-url-input"
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 min-w-0 px-4 py-3 font-sans text-xs text-muted focus:outline-none bg-transparent truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 whitespace-nowrap bg-ink px-5 py-3 font-sans text-[0.65rem] font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-ink/80"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Social buttons */}
        <div className="grid grid-cols-4 gap-4">
          {shareTargets.map((target) => (
            <button
              key={target.id}
              onClick={() => openShare(target.getUrl(shareUrl))}
              className="flex flex-col items-center gap-2 group"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${target.color}18`, color: target.color }}
              >
                {target.icon}
              </span>
              <span className="font-sans text-[0.6rem] text-muted group-hover:text-ink transition-colors">
                {target.label}
              </span>
            </button>
          ))}

          {/* Native share (mobile) */}
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-2 group"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-transform group-hover:scale-110">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" width="22" height="22">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </span>
              <span className="font-sans text-[0.6rem] text-muted group-hover:text-ink transition-colors">More</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
