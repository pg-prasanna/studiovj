import React from 'react'
import { Card } from '../common'
import { formatDate } from '../../utils/helpers'
import { Calendar, Plus, ImageIcon, Eye } from 'lucide-react'

export const RecentEventsSection = ({ events, onViewEvent, onCreateEvent, loading = false }) => {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
        </div>
        <button
          onClick={onCreateEvent}
          className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} />
          New Event
        </button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <Calendar size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No events yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
              onClick={() => onViewEvent?.(event.id)}
            >
              {/* Image */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
                {event.coverImageUrl ? (
                  <img
                    src={event.coverImageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                    <ImageIcon size={20} className="text-blue-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate group-hover:text-blue-600">
                  {event.title}
                </h4>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span>{formatDate(event.eventDate)}</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    event.status === 'published' ? 'bg-green-100 text-green-800' :
                    event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 flex items-center gap-4 text-sm text-gray-600">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{event.albums?.length || 0}</p>
                  <p className="text-xs">Albums</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-900">
                    {event.albums?.reduce((sum, a) => sum + (a.photos?.length || 0), 0) || 0}
                  </p>
                  <p className="text-xs">Photos</p>
                </div>
              </div>

              {/* Action */}
              <button
                className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewEvent?.(event.id)
                }}
              >
                <Eye size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
