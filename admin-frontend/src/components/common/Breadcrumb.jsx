import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export const Breadcrumb = ({ items = [] }) => {
  const location = useLocation()

  // Generate breadcrumbs from route and items
  const getBreadcrumbs = () => {
    if (items && items.length > 0) {
      return items
    }

    // Auto-generate from current path
    const pathparts = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: 'Dashboard', href: '/' }]

    let href = ''
    for (const part of pathparts) {
      href += `/${part}`
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ')
      breadcrumbs.push({ label, href })
    }

    return breadcrumbs
  }

  const crumbs = getBreadcrumbs()

  if (crumbs.length <= 1) {
    return null
  }

  return (
    <nav className="flex items-center gap-xs text-sm mb-lg">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1
        return (
          <div key={crumb.href || index} className="flex items-center gap-xs">
            {index > 0 && <ChevronRight size={16} className="text-gray-500" />}
            {isLast ? (
              <span className="text-gray-900 font-medium truncate">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.href}
                className="text-gray-700 hover:text-gray-900 transition-colors truncate"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}

export default Breadcrumb
