import React, { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { Camera, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Input, Button, Alert } from '../components/common/index'

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || '/dashboard'
    return <Navigate to={redirectTo} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setIsSubmitting(true)

    try {
      await login(email, password)

      const redirectTo = location.state?.from?.pathname || '/dashboard'

      navigate(redirectTo, { replace: true })
    } catch (err) {
      const apiMessage = err?.response?.data?.message

      if (err?.response?.status === 401 || err?.response?.status === 400) {
        setError(apiMessage || 'Invalid email or password.')
      } else if (err?.code === 'ERR_NETWORK') {
        setError('Unable to reach the server. Please try again later.')
      } else {
        setError(apiMessage || 'Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral px-md">
      <div className="w-full max-w-md">
        <div className="text-center mb-lg">
          <div className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center mx-auto mb-md">
            <Camera size={28} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            Studio VJ Admin
          </h1>

          <p className="text-gray-600 mt-xs">
            Sign in to manage your portfolio
          </p>
        </div>

        <div className="bg-white border border-neutral rounded-lg shadow-lg p-lg">
          {error && (
            <div className="mb-md">
              <Alert
                type="error"
                message={error}
                onClose={() => setError('')}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-md" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="w-full">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                style={{ width: '100%' }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-lg">
          Public portfolio visitors don&apos;t need to log in — this page is for studio admins only.
        </p>
      </div>
    </div>
  )
}

export default LoginPage