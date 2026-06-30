import React, { useState, useMemo, useCallback } from 'react'
import { useEvents, useDeleteEvent, usePublishEvent, useUnpublishEvent } from '../hooks'
import { useModal } from '../hooks'
import { EventCard, EmptyState, Loading, DeleteConfirmModal, Alert } from '../components'
import { Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../utils/helpers'

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'published', label: 'Published' },
]

export const EventsPage = () => {
  const navigate = useNavigate()
  const { data, isLoading, error } = useEvents()
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(0)
  const EVENTS_PER_PAGE = 50
  const deleteModal = useModal()
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [statusError, setStatusError] = useState(null)

  const deleteEventMutation = useDeleteEvent()
  const publishMutation = usePublishEvent()
  const unpublishMutation = useUnpublishEvent()

  const events = data?.data?.data || []

  // Count per status for tab badges
  const draftCount = events.filter((e) => e.status !== 'PUBLISHED').length
  const publishedCount = events.filter((e) => e.status === 'PUBLISHED').length

  const filteredEvents = useMemo(() => {
    // Sort latest first (newest eventDate at top)
    let result = [...events].sort((a, b) => new Date(b.eventDate || b.createdAt || 0) - new Date(a.eventDate || a.createdAt || 0))

    // Status tab filter
    if (activeTab === 'draft') {
      result = result.filter((e) => e.status !== 'PUBLISHED')
    } else if (activeTab === 'published') {
      result = result.filter((e) => e.status === 'PUBLISHED')
    }

    // Search
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase()
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(lower) ||
          e.description.includes(lower) ||
          e.location.includes(lower)
      )
    }

    return result
  }, [events, searchTerm, activeTab])

  const handleDelete = async () => {
    try {
      setDeleteError(null)
      await deleteEventMutation.mutateAsync(selectedEventId)
      deleteModal.close()
    } catch (err) {
      setDeleteError(getErrorMessage(err))
    }
  }

  const openDeleteModal = (eventId) => {
    setSelectedEventId(eventId)
    deleteModal.open()
  }

  // Toggle between published <-> draft
  const handlePublish = async (eventId) => {
    try {
      setStatusError(null)
      const event = events.find((e) => e.id === eventId)
      if (event?.status === 'PUBLISHED') {
        await unpublishMutation.mutateAsync(eventId)
      } else {
        await publishMutation.mutateAsync(eventId)
      }
    } catch (err) {
      setStatusError(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-600 mt-2">Manage all your photography events and organize them into albums</p>
        </div>
        <button
          onClick={() => navigate('/events/create')}
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold whitespace-nowrap"
        >
          + Create Event
        </button>
      </div>

      {error && <Alert type="error" title="Error loading events" message={getErrorMessage(error)} />}
      {statusError && <Alert type="error" title="Status update failed" message={statusError} onClose={() => setStatusError(null)} />}

      {/* Status Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {STATUS_TABS.map((tab) => {
          const count = tab.key === 'all' ? events.length : tab.key === 'draft' ? draftCount : publishedCount
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.key
                  ? tab.key === 'published' ? 'bg-green-100 text-green-700' : tab.key === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by event name, description, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
            ✕
          </button>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div>
          {/* Pagination info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              Showing {Math.min(page * EVENTS_PER_PAGE + 1, filteredEvents.length)}–{Math.min((page + 1) * EVENTS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </p>
            {Math.ceil(filteredEvents.length / EVENTS_PER_PAGE) > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronLeft size={16} /></button>
                <span className="text-sm text-gray-600">Page {page + 1} of {Math.ceil(filteredEvents.length / EVENTS_PER_PAGE)}</span>
                <button onClick={() => setPage(p => Math.min(Math.ceil(filteredEvents.length / EVENTS_PER_PAGE) - 1, p + 1))} disabled={page >= Math.ceil(filteredEvents.length / EVENTS_PER_PAGE) - 1} className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.slice(page * EVENTS_PER_PAGE, (page + 1) * EVENTS_PER_PAGE).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onView={(id) => navigate(`/albums/${id}`)}
                onEdit={(id) => navigate(`/events/edit/${id}`)}
                onDelete={openDeleteModal}
                onPublish={handlePublish}
                onAnalytics={(id) => navigate(`/events/${id}/analytics`)}
              />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={searchTerm ? 'No Events Found' : `No ${activeTab === 'all' ? '' : activeTab} Events`}
          description={
            searchTerm
              ? 'Try adjusting your search terms'
              : activeTab === 'draft'
              ? 'All your events are published!'
              : activeTab === 'published'
              ? 'No events published yet. Publish a draft to show it to viewers.'
              : 'Create your first event to get started'
          }
          action={!searchTerm && activeTab === 'all' ? 'Create First Event' : undefined}
          onAction={!searchTerm && activeTab === 'all' ? () => navigate('/events/create') : undefined}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Delete Event"
        message="This will delete the event along with all its albums and photos. This action cannot be undone."
      />

      {deleteError && (
        <Alert type="error" title="Delete failed" message={deleteError} onClose={() => setDeleteError(null)} />
      )}
    </div>
  )
}
