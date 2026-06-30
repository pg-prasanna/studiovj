import React, { useState, useMemo } from 'react'
import { useEvents, useDeleteEvent, useDashboardAnalytics } from '../hooks'
import { useModal } from '../hooks'
import { 
  DashboardStats, 
  Loading, 
  DeleteConfirmModal, 
  Alert,
  RecentEventsSection,
  QuickActionsSection,
} from '../components'
import { useNavigate } from 'react-router-dom'
import { getErrorMessage } from '../utils/helpers'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { data, isLoading, error } = useEvents()
  const { data: analyticsData } = useDashboardAnalytics()
  const deleteModal = useModal()
  const [selectedEventId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const deleteEventMutation = useDeleteEvent()

  const events = data?.data?.data || []
  const analytics = analyticsData?.data?.data || null

  // Calculate stats
  const stats = useMemo(() => ({
    totalEvents: events.length,
    totalAlbums: events.reduce((sum, e) => sum + (e.albums?.length || 0), 0),
    totalPhotos: events.reduce((sum, e) => sum + (e.albums?.reduce((s, a) => s + (a.photos?.length || 0), 0) || 0), 0),
    publishedEvents: events.filter(e => e.status === 'PUBLISHED').length,
    draftEvents: events.filter(e => e.status === 'DRAFT').length,
    totalGalleryViews: analytics?.totalGalleryViews ?? 0,
    uniqueVisitors: analytics?.uniqueVisitors ?? 0,
  }), [events, analytics])

  // Recent events (last 5)
  const recentEvents = useMemo(() =>
    [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [events]
  )

  const handleDelete = async () => {
    try {
      setDeleteError(null)
      await deleteEventMutation.mutateAsync(selectedEventId)
      deleteModal.close()
    } catch (err) {
      setDeleteError(getErrorMessage(err))
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Manage your photography events, albums, and photos.</p>
        </div>
        <button
          onClick={() => navigate('/events/create')}
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold whitespace-nowrap"
        >
          + Create Event
        </button>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          title="Error loading events"
          message={getErrorMessage(error)}
        />
      )}

      {/* Quick Actions */}
      <QuickActionsSection
        onCreateEvent={() => navigate('/events/create')}
        onUploadPhotos={() => {
          // Navigate to first event with albums, or show message
          const eventWithAlbums = events.find(e => e.albums?.length > 0)
          if (eventWithAlbums?.albums?.[0]) {
            navigate(`/albums/${eventWithAlbums.albums[0].id}/photos`)
          } else {
            navigate('/events')
          }
        }}
        onViewEvents={() => navigate('/events')}
      />

      {/* Recent Events Section */}
      <RecentEventsSection
        events={recentEvents}
        onViewEvent={(eventId) => navigate(`/albums/${eventId}`)}
        onCreateEvent={() => navigate('/events/create')}
        loading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
      />

      {deleteError && (
        <Alert
          type="error"
          title="Delete Error"
          message={deleteError}
          onClose={() => setDeleteError(null)}
        />
      )}
    </div>
  )
}
