import client from './client'

export const authAPI = {
  // Admin login - returns { token, tokenType, email, fullName, expiresIn }
  login: (credentials) => client.post('/admin/auth/login', credentials),

  // Logout (clears server-side state if/when implemented; client always clears local token)
  logout: () => client.post('/admin/auth/logout'),

  // Validate current token / fetch current admin info
  me: () => client.get('/admin/auth/me'),

  // Change password for the logged-in admin
  changePassword: (data) => client.put('/admin/auth/change-password', data),
}

export const eventAPI = {
  // Get all events
  getAll: (params = {}) => client.get('/events', { params }),

  // Get event by ID
  getById: (id) => client.get(`/events/${id}`),

  // Get published events
  getPublished: (params = {}) => client.get('/events/published', { params }),

  // Get featured events
  getFeatured: (params = {}) => client.get('/events/featured', { params }),

  // Create event
  create: (data) => client.post('/events', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Update event
  update: (id, data) => client.put(`/events/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Delete event
  delete: (id) => client.delete(`/events/${id}`),

  // Publish event
  publish: (id) => client.post(`/events/${id}/publish`),

  // Unpublish event
  unpublish: (id) => client.post(`/events/${id}/unpublish`),
}

export const albumAPI = {
  // Get albums by event
  getByEvent: (eventId) => client.get(`/albums/event/${eventId}`),

  // Get album by ID
  getById: (id) => client.get(`/albums/${id}`),

  // Create album
  create: (data) => client.post('/albums', data),

  // Update album
  update: (id, data) => client.put(`/albums/${id}`, data),

  // Delete album
  delete: (id) => client.delete(`/albums/${id}`),

  // Reorder albums
  reorder: (orderedIds) => client.put('/albums/reorder', { orderedIds }),
}

export const photoAPI = {
  // Get photos by album
  getByAlbum: (albumId) => client.get(`/photos/album/${albumId}`),

  // Get all photos (for media library)
  getAll: (params = {}) => client.get('/photos', { params }),

  // Get photo by ID
  getById: (id) => client.get(`/photos/${id}`),

  // Upload single photo
  uploadSingle: (data) => client.post('/photos/upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Upload multiple photos
  uploadBatch: (data) => client.post('/photos/batch-upload', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // Reorder photos in an album
  reorder: (albumId, orderedIds) => client.put(`/photos/album/${albumId}/reorder`, { orderedIds }),

  // Delete photo
  delete: (id) => client.delete(`/photos/${id}`),

  // Update photo orientation (manual override)
  updateOrientation: (id, orientation) => client.patch(`/photos/${id}/orientation`, null, {
    params: { orientation }
  }),
}

export const analyticsAPI = {
  // Dashboard-wide totals: total gallery views + unique visitors across all events
  getDashboard: () => client.get('/admin/analytics/dashboard'),

  // Per-event analytics: total views, unique visitors, visitor email list
  getEventAnalytics: (eventId) => client.get(`/admin/events/${eventId}/analytics`),
}

export const systemAPI = {
  // Get system statistics
  getStats: () => client.get('/system/stats'),

  // Get system health
  getHealth: () => client.get('/system/health'),

  // Get storage info
  getStorage: () => client.get('/system/storage'),
}

export const categoryAPI = {
  getAll: () => client.get('/categories'),
  create: (data) => client.post('/categories', data),
  update: (id, data) => client.put(`/categories/${id}`, data),
  delete: (id) => client.delete(`/categories/${id}`),
  reorder: (orderedIds) => client.put('/categories/reorder', { orderedIds }),
}

export const settingsAPI = {
  // Get all settings
  getAll: () => client.get('/settings'),

  // Update settings
  update: (data) => client.put('/settings', data),

  // Upload logo
  uploadLogo: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return client.post('/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Upload favicon
  uploadFavicon: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return client.post('/settings/favicon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // Get admin profile
  getProfile: () => client.get('/settings/profile'),

  // Update admin profile
  updateProfile: (data) => client.put('/settings/profile', data),
}
