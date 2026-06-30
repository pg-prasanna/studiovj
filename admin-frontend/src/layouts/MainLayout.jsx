import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header, Sidebar, Breadcrumb } from '../components'

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-md md:p-lg">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
