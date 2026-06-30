import React from 'react'
import { Menu, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Header = ({ onMenuClick }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { admin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    setShowProfileMenu(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-white border-b border-neutral sticky top-0 z-30">
      <div className="h-16 px-md flex items-center justify-between">
        <div className="flex items-center gap-md">
          <button
            onClick={onMenuClick}
            className="p-sm transition-colors lg:hidden text-gray-700 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Studio VJ Admin
          </h1>
        </div>

        <div className="flex items-center gap-md">
          {/* Admin Profile Menu */}
          <div className="relative ml-md">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white transition-all bg-accent hover:bg-opacity-90"
              title="Admin profile"
            >
              A
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-md rounded-lg shadow-lg border bg-white border-neutral overflow-hidden z-50">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-lg py-md hover:bg-neutral transition-colors text-gray-900 border-b border-neutral"
                >
                  {admin?.fullName || admin?.email || 'Admin User'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-lg py-md hover:bg-neutral transition-colors text-gray-900 hover:text-gray-900 flex items-center gap-md"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
