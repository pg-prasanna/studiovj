import React from 'react'
import { useForm } from 'react-hook-form'
import { Input, TextArea, Button } from '../common'
import { useQuery } from '@tanstack/react-query'
import { categoryAPI } from '../../api/endpoints'

export const EventForm = ({ onSubmit, initialData, isLoading }) => {
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  })
  const categories = categoriesData?.data?.data || []

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      location: '',
      eventDate: '',
      categoryId: '',
      clientEmail: '',
      clientDownloadPin: '',
    },
  })

  React.useEffect(() => {
    if (initialData) {
      // Normalise eventDate to YYYY-MM-DD so <input type="date"> renders it
      const normalised = { ...initialData }
      if (normalised.eventDate) {
        normalised.eventDate = normalised.eventDate.split('T')[0]
      }
      reset(normalised)
    }
  }, [initialData, reset])

  // Date is only required when creating, not editing
  const isEditing = !!initialData

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
      <Input
        label="Event Title"
        placeholder="E.g., Wedding of Sarah & John"
        required
        {...register('title', { required: 'Event title is required' })}
        error={errors.title?.message}
      />

      <TextArea
        label="Description"
        placeholder="Tell us about this event..."
        {...register('description')}
        error={errors.description?.message}
      />

      <Input
        label="Location"
        placeholder="E.g., Grand Ballroom, Downtown"
        {...register('location')}
        error={errors.location?.message}
      />

      <Input
        label="Date"
        type="date"
        required={!isEditing}
        {...register('eventDate', { 
          required: !isEditing ? 'Event date is required' : false 
        })}
        error={errors.eventDate?.message}
      />

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-sm">Category</label>
        <select
          {...register('categoryId')}
          className="w-full px-md py-sm rounded-md border bg-white border-neutral text-gray-900"
        >
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Download protection */}
      <div className="pt-2 border-t border-neutral">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">Download Protection</h4>
        <p className="text-xs text-gray-500 mb-md">
          Set a client email and PIN so only the client can download photos. Leave blank to allow all gallery visitors to download.
        </p>
        <div className="space-y-md">
          <Input
            label="Client Email"
            type="email"
            placeholder="client@example.com"
            {...register('clientEmail')}
            error={errors.clientEmail?.message}
          />
          <Input
            label="Download PIN"
            type="text"
            placeholder="4–20 characters (e.g. WEDDING2026)"
            {...register('clientDownloadPin', {
              minLength: { value: 4, message: 'PIN must be at least 4 characters' },
              maxLength: { value: 20, message: 'PIN must be at most 20 characters' },
            })}
            error={errors.clientDownloadPin?.message}
          />
          {isEditing && (
            <p className="text-xs text-gray-400">Leave PIN blank to keep the existing PIN unchanged.</p>
          )}
        </div>
      </div>

      <Button type="submit" loading={isLoading}>
        {initialData ? 'Update Event' : 'Create Event'}
      </Button>
    </form>
  )
}
