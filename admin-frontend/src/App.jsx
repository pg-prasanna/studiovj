import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { NotificationCenter } from './components/notifications/NotificationCenter'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { MainLayout } from './layouts/MainLayout'

import LoginPage from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { EventsPage } from './pages/EventsPage'
import { CreateEventPage } from './pages/CreateEventPage'
import { EditEventPage } from './pages/EditEventPage'
import { AlbumManagementPage } from './pages/AlbumManagementPage'
import { EventAnalyticsPage } from './pages/EventAnalyticsPage'
import { PhotoUploadPage } from './pages/PhotoUploadPage'
import MediaLibraryPage from './pages/MediaLibraryPage'
import SettingsPage from './pages/SettingsPage'
import CategoriesPage from './pages/CategoriesPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
    },
  },
})

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <QueryClientProvider client={queryClient}>
            <Router>
              <Routes>

                {/* Public Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/events" element={<EventsPage />} />
                  <Route path="/events/create" element={<CreateEventPage />} />
                  <Route path="/events/edit/:id" element={<EditEventPage />} />
                  <Route path="/albums/:eventId" element={<AlbumManagementPage />} />
                  <Route path="/events/:id/analytics" element={<EventAnalyticsPage />} />
                  <Route path="/albums/:albumId/photos" element={<PhotoUploadPage />} />
                  <Route path="/media-library" element={<MediaLibraryPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />

              </Routes>

              <NotificationCenter />
            </Router>
          </QueryClientProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App