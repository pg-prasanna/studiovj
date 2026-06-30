import React from 'react'
import { useForm } from 'react-hook-form'
import { Input, Button } from '../common'

export const AlbumForm = ({ onSubmit, initialData, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: initialData || {
      albumName: '',
    },
  })

  React.useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-lg">
      <Input
        label="Album Name"
        placeholder="E.g., Wedding Ceremony, Reception, Getting Ready"
        required
        {...register('albumName', { required: 'Album name is required' })}
        error={errors.albumName?.message}
      />

      <Button type="submit" loading={isLoading}>
        {initialData ? 'Update Album' : 'Create Album'}
      </Button>
    </form>
  )
}
