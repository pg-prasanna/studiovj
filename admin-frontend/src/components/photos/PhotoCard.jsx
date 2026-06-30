import React, { memo } from 'react'
import { formatDate, formatRelativeTime } from '../../utils/helpers'
import { Eye, Download, Trash2 } from 'lucide-react'
import { getCloudinaryThumb } from '../../utils/helpers'

export const PhotoCard = memo(({ photo, onView, onDownload, onDelete }) => {
  const ratio = photo.width && photo.height ? photo.width / photo.height : 1

  return (
    <div
      className="group relative overflow-hidden rounded-lg bg-gray-100"
      style={{ aspectRatio: ratio }}
    >
      <img
        src={getCloudinaryThumb(photo.imageUrl, { w: 400, h: 400 })}
        alt="Photo"
        className="w-full h-full object-cover"
        loading="lazy"
      />

      {/* Metadata Overlay - On Hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3 text-white">
        <div>
          <p className="text-xs font-medium">{formatDate(photo.createdAt)}</p>
          <p className="text-xs text-gray-300">{formatRelativeTime(photo.createdAt)}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center">
          {onView && (
            <button
              onClick={() => onView(photo)}
              className="p-2 bg-white text-gray-900 rounded-full hover:bg-blue-50 transition-colors"
              title="View"
            >
              <Eye size={16} />
            </button>
          )}
          {onDownload && (
            <button
              onClick={() => onDownload(photo)}
              className="p-2 bg-white text-gray-900 rounded-full hover:bg-blue-50 transition-colors"
              title="Download"
            >
              <Download size={16} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(photo.id)}
              className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
)