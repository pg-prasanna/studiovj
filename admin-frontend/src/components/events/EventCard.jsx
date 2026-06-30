import React, { memo } from 'react'
import { formatDate, getCloudinaryThumb } from '../../utils/helpers'
import { MoreVertical, Edit2, Trash2, FolderOpen, ImageIcon, MapPin, Calendar, BarChart3 } from 'lucide-react'
import { Card } from '../common'

const getStatusBadgeClass = (status) => {
  const baseClass = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium'
  switch (status) {
    case 'PUBLISHED':
      return `${baseClass} bg-green-100 text-green-800`
    case 'DRAFT':
      return `${baseClass} bg-yellow-100 text-yellow-800`
    case 'ARCHIVED':
      return `${baseClass} bg-gray-100 text-gray-800`
    default:
      return `${baseClass} bg-blue-100 text-blue-800`
  }
}

const getStatusDotClass = (status) => {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-500'
    case 'DRAFT':
      return 'bg-yellow-500'
    case 'ARCHIVED':
      return 'bg-gray-500'
    default:
      return 'bg-blue-500'
  }
}

export const EventCard = memo(({ event, onView, onEdit, onDelete, onPublish, onAnalytics }) => {
  const [showMenu, setShowMenu] = React.useState(false)
  const menuRef = React.useRef(null)

  const albumCount = event.albums?.length || 0
  const photoCount = event.albums?.reduce((sum, a) => sum + (a.photos?.length || 0), 0) || 0

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Card className="relative hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
      {/* Image Container with overlay */}
      <div className="relative w-full h-48 bg-gradient-to-br from-neutral to-white overflow-hidden rounded-t-lg">
        {event.coverImageUrl ? (
          <>
            <img
              src={getCloudinaryThumb(event.coverImageUrl, { w: 400, h: 300 })}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center">
              <ImageIcon size={32} className="text-blue-300 mx-auto mb-2" />
              <span className="text-sm text-blue-400">No cover image</span>
            </div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={getStatusBadgeClass(event.status)}>
            <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDotClass(event.status)}`} />
            {event.status}
          </span>
        </div>
      </div>

      {/* Menu Button - sibling of the clipped image container so its dropdown isn't cut off */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-gray-900"
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-neutral rounded-lg shadow-xl z-50 min-w-48 overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  onView?.(event.id)
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-3"
              >
                <FolderOpen size={16} />
                View Albums
              </button>
              <button
                type="button"
                onClick={() => {
                  onEdit?.(event.id)
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-3 border-t border-neutral"
              >
                <Edit2 size={16} />
                Edit Event
              </button>
              <button
                type="button"
                onClick={() => {
                  onAnalytics?.(event.id)
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-3 border-t border-neutral"
              >
                <BarChart3 size={16} />
                View Analytics
              </button>
              <button
                type="button"
                onClick={() => {
                  onPublish?.(event.id)
                  setShowMenu(false)
                }}
                className={`w-full text-left px-4 py-3 text-sm border-t border-neutral flex items-center gap-3 transition-colors ${
                  event.status === 'PUBLISHED'
                    ? 'text-yellow-700 hover:bg-yellow-50'
                    : 'text-green-700 hover:bg-green-50'
                }`}
              >
                {event.status === 'PUBLISHED' ? '📝 Set to Draft' : '✓ Publish'}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete?.(event.id)
                  setShowMenu(false)
                }}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 border-t border-neutral"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-accent transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">
          {event.description || 'No description provided'}
        </p>

        {/* Location and Date */}
        <div className="space-y-2 mb-4 text-sm">
          {event.location && (
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin size={16} className="text-accent flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar size={16} className="text-accent flex-shrink-0" />
            <span>{formatDate(event.eventDate)}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mt-auto pt-3 border-t border-neutral">
          <div className="flex items-center gap-2 text-sm">
            <FolderOpen size={16} className="text-blue-500" />
            <span className="font-medium text-gray-900">{albumCount}</span>
            <span className="text-gray-700">Album{albumCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ImageIcon size={16} className="text-purple-500" />
            <span className="font-medium text-gray-900">{photoCount}</span>
            <span className="text-gray-700">Photo{photoCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons - visible on mobile, hidden on hover tooltip on desktop */}
      <div className="px-4 pb-4 border-t border-neutral pt-3 flex gap-2 flex-col sm:hidden">
        <button
          onClick={() => onView?.(event.id)}
          className="w-full px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors font-medium"
        >
          View Albums
        </button>
        <button
          onClick={() => onEdit?.(event.id)}
          className="w-full px-3 py-2 text-sm bg-accent text-white rounded-md hover:bg-opacity-90 transition-colors font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onAnalytics?.(event.id)}
          className="w-full px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors font-medium"
        >
          Analytics
        </button>
      </div>
    </Card>
  )
}
)