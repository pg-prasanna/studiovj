import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const TOKEN_KEY = 'studiovj_admin_token'
const ADMIN_KEY = 'studiovj_admin_user'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Automatically attach JWT token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Handle unauthorized responses
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ADMIN_KEY)

      delete client.defaults.headers.common['Authorization']

      const isOnLoginPage =
        window.location.pathname === '/login' ||
        window.location.pathname.startsWith('/login')

      if (!isOnLoginPage) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default client