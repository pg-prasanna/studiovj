import client from '../api/client'

export const eventService = {
  getAll: async () => {
    const response = await client.get('/events')
    return response.data.data
  },

  getById: async (id) => {
    const response = await client.get(`/events/${id}`)
    return response.data.data
  },

  getPublished: async () => {
    const response = await client.get('/events/published')
    return response.data.data
  },

  getByCategory: async (categoryId) => {
    const response = await client.get(`/events/by-category/${categoryId}`)
    return response.data.data
  },

  // Record a guest visit (email gate) for analytics
  trackVisit: async (id, email) => {
    const response = await client.post(`/events/${id}/visit`, { email })
    return response.data
  },

  // Verify download credentials (email + PIN) for a protected event
  verifyDownload: async (id, email, pin) => {
    const response = await client.post(`/events/${id}/verify-download`, { email, pin })
    return response.data
  },
}

export const albumService = {
  // Download an entire album as a ZIP. Requires the same email + PIN
  // configured by the admin on the event (verified server-side).
  // Returns the raw ZIP blob on success; throws (401) for invalid credentials.
  downloadZip: async (albumId, email, pin) => {
    const response = await client.post(
      `/albums/${albumId}/download`,
      { email, pin },
      { responseType: 'blob' }
    )
    return response.data
  },
}

export const settingsService = {
  get: async () => {
    const response = await client.get('/settings')
    return response.data.data
  },
}

export const categoryService = {
  getAll: async () => {
    const response = await client.get('/categories')
    return response.data.data
  },
}
