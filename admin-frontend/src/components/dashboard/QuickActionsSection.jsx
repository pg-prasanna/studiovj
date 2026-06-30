import React from 'react'
import { Card } from '../common'
import { Plus, ImageIcon, Eye, Zap } from 'lucide-react'

export const QuickActionsSection = ({ onCreateEvent, onUploadPhotos, onViewEvents }) => {
  const actions = [
    {
      id: 'create-event',
      label: 'Create Event',
      description: 'Start a new event',
      icon: Plus,
      onClick: onCreateEvent,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'upload-photos',
      label: 'Upload Photos',
      description: 'Add photos to an album',
      icon: ImageIcon,
      onClick: onUploadPhotos,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      id: 'view-events',
      label: 'View Events',
      description: 'Browse all events',
      icon: Eye,
      onClick: onViewEvents,
      color: 'bg-green-600 hover:bg-green-700',
    },
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Zap size={24} className="text-yellow-600" />
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`${action.color} text-white p-6 rounded-lg transition-all hover:shadow-lg flex flex-col items-center gap-3 group`}
            >
              <Icon size={32} className="group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <p className="font-semibold">{action.label}</p>
                <p className="text-sm opacity-90">{action.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
