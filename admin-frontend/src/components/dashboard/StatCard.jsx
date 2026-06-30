import React from 'react'
import { Calendar, Folder, ImageIcon, CheckCircle, Clock, Eye, Users } from 'lucide-react'
import { Card } from '../common'

export const StatCard = ({ icon: Icon, label, value, trend, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    danger: 'bg-red-50',
    purple: 'bg-purple-50',
  }

  const iconBg = {
    default: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  return (
    <Card className={`p-6 ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend !== undefined && (
              <span className={`text-xs font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </span>
            )}
          </div>
          {trend !== undefined && (
            <p className="text-xs text-gray-500 mt-2">from last month</p>
          )}
        </div>
        <div className={`flex-shrink-0 p-3 rounded-lg ${iconBg[variant]}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  )
}

export const DashboardStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <StatCard
        icon={Calendar}
        label="Total Events"
        value={stats?.totalEvents || 0}
        variant="default"
      />
      <StatCard
        icon={Folder}
        label="Total Albums"
        value={stats?.totalAlbums || 0}
        variant="purple"
      />
      <StatCard
        icon={ImageIcon}
        label="Total Photos"
        value={stats?.totalPhotos || 0}
        variant="warning"
      />
      <StatCard
        icon={CheckCircle}
        label="Published"
        value={stats?.publishedEvents || 0}
        variant="success"
      />
      <StatCard
        icon={Clock}
        label="Drafts"
        value={stats?.draftEvents || 0}
        variant="warning"
      />
      <StatCard
        icon={Eye}
        label="Total Gallery Views"
        value={stats?.totalGalleryViews ?? 0}
        variant="default"
      />
      <StatCard
        icon={Users}
        label="Unique Visitors"
        value={stats?.uniqueVisitors ?? 0}
        variant="purple"
      />
    </div>
  )
}
