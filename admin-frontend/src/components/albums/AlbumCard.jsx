import React, { useMemo, memo } from 'react'
import { Plus, Edit2, Trash2, Image as ImageIcon, Calendar } from 'lucide-react'
import { getCloudinaryThumb } from '../../utils/helpers'
import { formatRelativeTime, getAlbumCoverImage } from '../../utils/helpers'

export const AlbumCard = memo(({
  album,
  photos = [],
  onEdit,
  onDelete,
  onPhotos,
}) => {
  // Prefer album.photos (from events API) over the photos prop (often empty)
  const effectivePhotos = (album.photos?.length > 0 ? album.photos : photos)
  const coverImage = useMemo(() => getAlbumCoverImage(effectivePhotos), [effectivePhotos])
  const photoCount = effectivePhotos?.length || 0
  const lastUpdated = effectivePhotos?.[0]?.createdAt

  return (
    <div className="group cursor-pointer rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-200">
      {/* Album Cover Image */}
      <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
        {coverImage ? (
          <img
            src={getCloudinaryThumb(coverImage, { w: 400, h: 400 })}
            alt={album.albumName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <ImageIcon size={48} className="text-gray-400" />
          </div>
        )}

        {/* Hover Overlay with Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <button
            onClick={() => onPhotos?.(album.id)}
            className="p-3 bg-white text-gray-900 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
            title="View Photos"
          >
            <Plus size={24} />
          </button>
          <button
            onClick={() => onEdit?.(album)}
            className="p-3 bg-white text-gray-900 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
            title="Edit Album"
          >
            <Edit2 size={24} />
          </button>
          <button
            onClick={() => onDelete?.(album.id)}
            className="p-3 bg-white text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors"
            title="Delete Album"
          >
            <Trash2 size={24} />
          </button>
        </div>

        {/* Photo Count Badge */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
          <ImageIcon size={14} />
          {photoCount}
        </div>
      </div>

      {/* Album Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
          {album.albumName}
        </h3>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span className="font-medium text-gray-700">
            {photoCount} photo{photoCount !== 1 ? 's' : ''}
          </span>
          {lastUpdated && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatRelativeTime(lastUpdated)}
            </span>
          )}
        </div>

        {/* Quick Action Button */}
        <button
          onClick={() => onPhotos?.(album.id)}
          className="w-full py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
        >
          View & Manage Photos
        </button>
      </div>
    </div>
  )
}
)