import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEventById, useUpdateEvent } from '../hooks'
import { EventForm, CoverImageUpload, Loading, Alert } from '../components'
import { getErrorMessage } from '../utils/helpers'
import { ChevronLeft } from 'lucide-react'

export const EditEventPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useEventById(id)
  const updateMutation = useUpdateEvent(id)
  const [coverImage, setCoverImage] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  const event = data?.data?.data

  const handleSubmit = async (formData) => {
    try {
      setUploadError(null)
      const form = new FormData()
      form.append('title', formData.title || '')
      form.append('description', formData.description || '')
      form.append('location', formData.location || '')
      // Always send date — use form value or fall back to existing event date
      const dateValue = formData.eventDate
        ? formData.eventDate.split('T')[0]
        : (event?.eventDate ? event.eventDate.split('T')[0] : '')
      form.append('eventDate', dateValue)
      if (formData.categoryId) form.append('categoryId', formData.categoryId)
      if (formData.clientEmail !== undefined) form.append('clientEmail', formData.clientEmail || '')
      if (formData.clientDownloadPin) form.append('clientDownloadPin', formData.clientDownloadPin)
      
      if (coverImage) {
        form.append('coverImage', coverImage)
      }

      await updateMutation.mutateAsync(form)
      navigate('/events')
    } catch (err) {
      setUploadError(getErrorMessage(err))
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
    <div className="max-w-2xl space-y-lg animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-md mb-lg">
        <button
          onClick={() => navigate('/events')}
          className="p-sm text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Event</h1>
      </div>

      {error && (
        <Alert
          type="error"
          title="Error loading event"
          message={getErrorMessage(error)}
        />
      )}

      {uploadError && (
        <Alert
          type="error"
          title="Update failed"
          message={uploadError}
          onClose={() => setUploadError(null)}
        />
      )}

      {event && (
        <div className="card p-lg space-y-lg">
          {/* Form */}
          <EventForm
            onSubmit={handleSubmit}
            initialData={event}
            isLoading={updateMutation.isPending}
          />

          {/* Cover Image */}
          <div className="space-y-md">
            <h3 className="font-semibold text-gray-900">Cover Image</h3>
            <CoverImageUpload onFileReady={setCoverImage} />
            {event.coverImageUrl && !coverImage && (
              <div>
                <p className="text-sm text-gray-700 mb-md">Current cover image:</p>
                <img
                  src={event.coverImageUrl}
                  alt="Cover"
                  className="w-full object-cover rounded-md"
                  style={{ aspectRatio: 3 / 2 }}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
