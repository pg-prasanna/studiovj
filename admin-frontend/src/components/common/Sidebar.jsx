import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  Image,
  Settings,
  Tag,
  ChevronRight,
  X,
} from 'lucide-react'
import { useLocalStorage } from '../../hooks'
import { useTheme } from '../../contexts/ThemeContext'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'events', label: 'Events', icon: Calendar, path: '/events' },
  { id: 'categories', label: 'Categories', icon: Tag, path: '/categories' },
  { id: 'media-library', label: 'Media Library', icon: Image, path: '/media-library' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
]

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { isDark } = useTheme()
  const [sidebarOpen] = useLocalStorage('sidebarOpen', true)

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true
    if (path !== '/' && location.pathname.startsWith(path)) return true
    return false
  }

  const handleLinkClick = () => {
    if (!sidebarOpen) {
      onClose?.()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-20"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed lg:static inset-y-0 left-0 w-64 z-30 transition-transform duration-300 lg:transition-none flex flex-col h-screen bg-white border-neutral border-r overflow-y-auto"
        style={{ transform: isOpen ? 'translateX(0)' : '-100%' }}
      >
        {/* Header */}
        <div className="h-16 px-lg flex items-center justify-between border-b border-neutral">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">SV</span>
            </div>
            <span className="font-semibold text-gray-900">Studio VJ</span>
          </div>
          <button
            onClick={onClose}
            className="p-xs text-gray-700 hover:text-gray-900 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-md space-y-xs overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={handleLinkClick}
                className={`flex items-center gap-md px-md py-sm rounded-md transition-all ${
                  active
                    ? 'bg-accent text-white'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-neutral'
                }`}
              >
                <Icon size={20} />
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                {active && <ChevronRight size={16} />}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className={`p-md border-t ${isDark ? 'border-gray-700' : 'border-neutral'}`}>
          <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-700'}`}>
            <p>v1.0.0</p>
            <p>© 2024 Studio VJ</p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
