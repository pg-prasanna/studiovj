import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import client from '../api/client'
import { authAPI } from '../api/endpoints'

const AuthContext = createContext(undefined)

const TOKEN_KEY = 'studiovj_admin_token'
const ADMIN_KEY = 'studiovj_admin_user'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [admin, setAdmin] = useState(() => {
    try {
      const saved = localStorage.getItem(ADMIN_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(true)

  // Keep the axios client header in sync with the current token
  useEffect(() => {
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete client.defaults.headers.common['Authorization']
    }
  }, [token])

  // Validate any stored token on app load
  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setIsLoading(false)
        return
      }
      try {
        const res = await authAPI.me()
        const data = res.data?.data
        if (data) {
          setAdmin(data)
          localStorage.setItem(ADMIN_KEY, JSON.stringify(data))
        }
      } catch (err) {
        // Token invalid or expired
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(ADMIN_KEY)
        setToken(null)
        setAdmin(null)
      } finally {
        setIsLoading(false)
      }
    }
    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password })
    const data = res.data?.data
    if (!data?.token) {
      throw new Error('Invalid login response')
    }
    localStorage.setItem(TOKEN_KEY, data.token)
    const adminData = { email: data.email, fullName: data.fullName }
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData))
    setToken(data.token)
    setAdmin(adminData)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // Ignore network errors on logout - clear local session regardless
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ADMIN_KEY)
      setToken(null)
      setAdmin(null)
    }
  }, [])

  const value = {
    token,
    admin,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)
export const clearStoredAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_KEY)
}
