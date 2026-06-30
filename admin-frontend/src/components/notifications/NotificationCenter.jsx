import React from 'react'
import { Check, AlertCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useNotification } from '../../contexts/NotificationContext'
import { useTheme } from '../../contexts/ThemeContext'

const Toast = ({ notification, onClose }) => {
  const { isDark } = useTheme()

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <Check size={20} className="text-green-500" />
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />
      case 'info':
      default:
        return <Info size={20} className="text-blue-500" />
    }
  }

  const getStyle = () => {
    switch (notification.type) {
      case 'success':
        return isDark
          ? 'bg-green-900 border-green-700 text-green-100'
          : 'bg-green-50 border-green-200 text-green-900'
      case 'error':
        return isDark
          ? 'bg-red-900 border-red-700 text-red-100'
          : 'bg-red-50 border-red-200 text-red-900'
      case 'warning':
        return isDark
          ? 'bg-yellow-900 border-yellow-700 text-yellow-100'
          : 'bg-yellow-50 border-yellow-200 text-yellow-900'
      case 'info':
      default:
        return isDark
          ? 'bg-blue-900 border-blue-700 text-blue-100'
          : 'bg-blue-50 border-blue-200 text-blue-900'
    }
  }

  return (
    <div
      className={`
        flex items-center gap-md p-md rounded-lg border shadow-lg
        animate-in slide-in-from-top-2 fade-in duration-200
        ${getStyle()}
      `}
    >
      {getIcon()}
      <span className="flex-1 text-sm font-medium">{notification.message}</span>
      <button
        onClick={onClose}
        className="p-xs hover:opacity-70 transition-opacity"
      >
        <X size={18} />
      </button>
    </div>
  )
}

export const NotificationCenter = () => {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-sm max-w-md">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}
