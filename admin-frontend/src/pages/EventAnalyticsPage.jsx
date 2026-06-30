import React, { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Eye, Users, Search, Download, ArrowLeft } from 'lucide-react'
import { useEventAnalytics, useEventById } from '../hooks'
import { Loading, Alert, Card, EmptyState } from '../components'
import { formatDateTime, getErrorMessage } from '../utils/helpers'

function downloadCsv(filename, rows) {
  const csvContent = rows.map((row) =>
    row
      .map((cell) => {
        const value = cell === null || cell === undefined ? '' : String(cell)
        // Escape quotes and wrap in quotes if it contains a comma, quote, or newline
        if (/[",\n]/.test(value)) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(',')
  ).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const EventAnalyticsPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: eventData } = useEventById(id)
  const { data, isLoading, error } = useEventAnalytics(id)
  const [searchTerm, setSearchTerm] = useState('')

  const event = eventData?.data?.data
  const analytics = data?.data?.data
  const visitors = analytics?.visitors || []

  const filteredVisitors = useMemo(() => {
    if (!searchTerm.trim()) return visitors
    const lower = searchTerm.toLowerCase()
    return visitors.filter((v) => v.email.toLowerCase().includes(lower))
  }, [visitors, searchTerm])

  const handleExportCsv = () => {
    const header = ['Email', 'Visits', 'First Visit', 'Last Visit']
    const rows = filteredVisitors.map((v) => [
      v.email,
      v.visitCount,
      formatDateTime(v.firstVisit),
      formatDateTime(v.lastVisit),
    ])
    const eventSlug = (analytics?.eventTitle || event?.title || 'event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    downloadCsv(`${eventSlug}-visitors.csv`, [header, ...rows])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Events
        </button>
        <div className="flex items-center justify-between flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {analytics?.eventTitle || event?.title || 'Event Analytics'}
            </h1>
            <p className="text-gray-600 mt-2">Visitor analytics for this gallery</p>
          </div>
        </div>
      </div>

      {error && <Alert type="error" title="Error loading analytics" message={getErrorMessage(error)} />}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-blue-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Views</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.totalViews ?? 0}</p>
            </div>
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100 text-blue-600">
              <Eye size={24} />
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-purple-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Unique Visitors</p>
              <p className="text-3xl font-bold text-gray-900">{analytics?.uniqueVisitors ?? 0}</p>
            </div>
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100 text-purple-600">
              <Users size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Search + Export */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by visitor email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
              ✕
            </button>
          )}
        </div>
        <button
          onClick={handleExportCsv}
          disabled={filteredVisitors.length === 0}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-lg hover:bg-opacity-90 transition-colors font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Visitor Table */}
      {filteredVisitors.length > 0 ? (
        <Card className="overflow-hidden">
          <p className="text-sm text-gray-600 px-6 pt-4">
            Showing {filteredVisitors.length} of {visitors.length} visitor{visitors.length !== 1 ? 's' : ''}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="border-b border-neutral text-left text-gray-600">
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Visits</th>
                  <th className="px-6 py-3 font-medium">First Visit</th>
                  <th className="px-6 py-3 font-medium">Last Visit</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisitors.map((v) => (
                  <tr key={v.email} className="border-b border-neutral last:border-0 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-900 font-medium">{v.email}</td>
                    <td className="px-6 py-3 text-gray-700">{v.visitCount}</td>
                    <td className="px-6 py-3 text-gray-700">{formatDateTime(v.firstVisit)}</td>
                    <td className="px-6 py-3 text-gray-700">{formatDateTime(v.lastVisit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={Users}
          title={searchTerm ? 'No Visitors Found' : 'No Visitors Yet'}
          description={
            searchTerm
              ? 'Try adjusting your search terms'
              : 'No one has accessed this gallery yet. Visitor emails will appear here once guests enter the gallery.'
          }
        />
      )}
    </div>
  )
}

export default EventAnalyticsPage
