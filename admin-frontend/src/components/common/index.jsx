import React, { useState, forwardRef } from 'react'
import { X, AlertCircle } from 'lucide-react'

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className={`${sizeClasses[size]} w-full mx-md pointer-events-auto card animate-slide-up`}>
          <div className="flex items-center justify-between p-lg border-b border-neutral">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-xs text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-lg">{children}</div>
        </div>
      </div>
    </>
  )
}

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Delete Confirmation', message = 'Are you sure you want to delete this item?' }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    setIsDeleting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-lg">
        <div className="flex gap-md items-start">
          <div className="flex-shrink-0">
            <AlertCircle className="text-danger" size={24} />
          </div>
          <p className="text-gray-700">{message}</p>
        </div>
        <div className="flex gap-md justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export const Alert = ({ type = 'info', title, message, onClose }) => {
  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }

  return (
    <div className={`${typeClasses[type]} border rounded-md p-md flex items-start justify-between`}>
      <div>
        {title && <h3 className="font-semibold mb-xs">{title}</h3>}
        {message && <p className="text-sm">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 ml-md">
          <X size={18} />
        </button>
      )}
    </div>
  )
}

export const Badge = ({ label, variant = 'primary', size = 'md' }) => {
  const variantClasses = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  }

  const sizeClasses = {
    sm: 'text-xs px-xs py-xs',
    md: 'text-sm px-sm py-xs',
    lg: 'text-base px-md py-sm',
  }

  return (
    <span className={`badge ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {label}
    </span>
  )
}

export const Loading = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full border-4 border-neutral border-t-accent animate-spin`} />
  )
}

export const EmptyState = ({ icon: Icon, title, description, action, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gray-50 rounded-full p-6 mb-6">
        {Icon && <Icon size={48} className="text-gray-400" />}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-8 text-center max-w-md text-lg">{description}</p>
      {action && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
        >
          {action}
        </button>
      )}
    </div>
  )
}

export const Card = ({ children, className = '', clickable = false, onClick }) => {
  return (
    <div
      className={`card p-lg ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export const Input = forwardRef(({ label, error, required, ...props }, ref) => {
  return (
    <div className="space-y-xs">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-danger ml-xs">*</span>}
        </label>
      )}
      <input ref={ref} className={`input-base ${error ? 'border-danger focus:ring-danger' : ''}`} {...props} />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'

export const TextArea = forwardRef(({ label, error, required, ...props }, ref) => {
  return (
    <div className="space-y-xs">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-danger ml-xs">*</span>}
        </label>
      )}
      <textarea ref={ref} className={`input-base min-h-32 resize-none ${error ? 'border-danger focus:ring-danger' : ''}`} {...props} />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
})
TextArea.displayName = 'TextArea'

export const Select = forwardRef(({ label, error, required, options = [], ...props }, ref) => {
  return (
    <div className="space-y-xs">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="text-danger ml-xs">*</span>}
        </label>
      )}
      <select ref={ref} className={`input-base ${error ? 'border-danger focus:ring-danger' : ''}`} {...props}>
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'

export const Button = ({ children, variant = 'primary', size = 'md', loading = false, ...props }) => {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  }

  const sizeClasses = {
    sm: 'btn-small',
    md: 'btn-base',
    lg: 'btn-base px-lg py-md text-lg',
  }

  return (
    <button
      className={`${variantClasses[variant]} ${sizeClasses[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loading size="sm" />
          <span className="ml-sm">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
