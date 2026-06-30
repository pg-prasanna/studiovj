import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventAPI, albumAPI, photoAPI, systemAPI, settingsAPI, analyticsAPI } from '../api/endpoints'

// Analytics hooks
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsAPI.getDashboard(),
    staleTime: 1000 * 60, // 1 minute
  })
}

export const useEventAnalytics = (eventId) => {
  return useQuery({
    queryKey: ['analytics', 'event', eventId],
    queryFn: () => analyticsAPI.getEventAnalytics(eventId),
    enabled: !!eventId,
  })
}

// Event hooks
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: () => eventAPI.getAll(),
  })
}

export const useEventById = (id) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventAPI.getById(id),
    enabled: !!id,
  })
}

export const usePublishedEvents = () => {
  return useQuery({
    queryKey: ['events', 'published'],
    queryFn: () => eventAPI.getPublished(),
  })
}

export const useFeaturedEvents = () => {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => eventAPI.getFeatured(),
  })
}

export const useCreateEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => eventAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export const useUpdateEvent = (id) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => eventAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', id] })
    },
  })
}

export const useDeleteEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => eventAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['albums'] })
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}

export const usePublishEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => eventAPI.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export const useUnpublishEvent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => eventAPI.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// Album hooks
export const useAlbumsByEvent = (eventId) => {
  return useQuery({
    queryKey: ['albums', eventId],
    queryFn: () => albumAPI.getByEvent(eventId),
    enabled: !!eventId,
  })
}

export const useAlbumById = (id) => {
  return useQuery({
    queryKey: ['albums', id],
    queryFn: () => albumAPI.getById(id),
    enabled: !!id,
  })
}

export const useCreateAlbum = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => albumAPI.create(data),
    onSuccess: (data) => {
      const eventId = data.data.eventId
      queryClient.invalidateQueries({ queryKey: ['albums', eventId] })
    },
  })
}

export const useUpdateAlbum = (id) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => albumAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] })
      queryClient.invalidateQueries({ queryKey: ['albums', id] })
    },
  })
}

export const useDeleteAlbum = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => albumAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['photos'] })
    },
  })
}

export const useReorderAlbums = (eventId) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderedIds) => albumAPI.reorder(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// Photo hooks
export const usePhotosByAlbum = (albumId) => {
  return useQuery({
    queryKey: ['photos', albumId],
    queryFn: () => photoAPI.getByAlbum(albumId),
    enabled: !!albumId,
    staleTime: 0,
  })
}

export const usePhotoById = (id) => {
  return useQuery({
    queryKey: ['photos', id],
    queryFn: () => photoAPI.getById(id),
    enabled: !!id,
  })
}

export const useUploadPhoto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => photoAPI.uploadSingle(data),
    onSuccess: (data) => {
      const albumId = data.data.albumId
      queryClient.invalidateQueries({ queryKey: ['photos', albumId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export const useUploadPhotos = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => photoAPI.uploadBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export const useUpdatePhotoOrientation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, orientation }) => photoAPI.updateOrientation(id, orientation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export const useDeletePhoto = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => photoAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// Media Library hooks
export const useAllPhotos = (params) => {
  return useQuery({
    queryKey: ['photos', 'all', params],
    queryFn: () => photoAPI.getAll(params),
  })
}

// System hooks
export const useSystemStats = () => {
  return useQuery({
    queryKey: ['system', 'stats'],
    queryFn: () => systemAPI.getStats(),
    staleTime: 1000 * 60, // 1 minute
  })
}

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => systemAPI.getHealth(),
    staleTime: 1000 * 30, // 30 seconds
  })
}

export const useSystemStorage = () => {
  return useQuery({
    queryKey: ['system', 'storage'],
    queryFn: () => systemAPI.getStorage(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Settings hooks
export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsAPI.getAll(),
  })
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => settingsAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] })
    },
  })
}

export const useStudioSettings = () => {
  return useQuery({
    queryKey: ['settings', 'studio'],
    queryFn: () => settingsAPI.getStudio(),
  })
}

export const useUpdateStudioSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => settingsAPI.updateStudio(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['settings', 'studio'] })
    },
  })
}

export const useAdminProfile = () => {
  return useQuery({
    queryKey: ['settings', 'profile'],
    queryFn: () => settingsAPI.getProfile(),
  })
}

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => settingsAPI.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['settings', 'profile'] })
    },
  })
}

export const useReorderPhotos = (albumId) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds) => photoAPI.reorder(albumId, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos', albumId] })
    },
  })
}

export const useDeletePhotos = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => photoAPI.delete(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
