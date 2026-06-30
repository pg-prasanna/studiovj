import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateEvent } from '../hooks'
import { EventForm, CoverImageUpload, Alert } from '../components'
import { getErrorMessage } from '../utils/helpers'
import { ChevronLeft } from 'lucide-react'

export const CreateEventPage = () => {
  const navigate = useNavigate()
  const createMutation = useCreateEvent()
  const [coverImage, setCoverImage] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  const handleSubmit = async (formData) => {
    try {
      setUploadError(null)
      
      if (!coverImage) {
        setUploadError('Please select a cover image')
        return
      }

      const form = new FormData()
      form.append('title', formData.title)
      form.append('description', formData.description)
      form.append('location', formData.location)
      form.append('eventDate', formData.eventDate)
      if (formData.categoryId) form.append('categoryId', formData.categoryId)
      if (formData.clientEmail) form.append('clientEmail', formData.clientEmail)
      if (formData.clientDownloadPin) form.append('clientDownloadPin', formData.clientDownloadPin)
      form.append('coverImage', coverImage)

      await createMutation.mutateAsync(form)
      navigate('/events')
    } catch (err) {
      setUploadError(getErrorMessage(err))
    }
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
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
      </div>

      {uploadError && (
        <Alert
          type="error"
          title="Creation failed"
          message={uploadError}
          onClose={() => setUploadError(null)}
        />
      )}

      <div className="card p-lg space-y-lg">
        {/* Form */}
        <EventForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
        />

        {/* Cover Image */}
        <div className="space-y-md">
          <h3 className="font-semibold text-gray-900">Cover Image</h3>
          <CoverImageUpload
            onFileReady={setCoverImage}
            error={uploadError && !coverImage ? 'Cover image is required' : undefined}
          />
        </div>
      </div>
    </div>
  )
}
