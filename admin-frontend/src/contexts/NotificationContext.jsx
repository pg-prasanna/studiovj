import React, { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

let notificationId = 0

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = notificationId++
      const notification = { id, message, type }

      setNotifications((prev) => [...prev, notification])

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id)
        }, duration)
      }

      return id
    },
    []
  )

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const notify = {
    success: (message, duration) =>
      addNotification(message, 'success', duration),
    error: (message, duration) =>
      addNotification(message, 'error', duration),
    warning: (message, duration) =>
      addNotification(message, 'warning', duration),
    info: (message, duration) =>
      addNotification(message, 'info', duration),
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        notify,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
