import React, { useState, useMemo, useCallback, memo } from 'react'
import { useNotification } from '../contexts/NotificationContext'
import { useEvents, useDeletePhoto } from '../hooks'
import { Search, ChevronDown, Grid, Download, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getCloudinaryThumb } from '../utils/helpers'
import { Loading, DeleteConfirmModal } from '../components'

const getFileNameFromUrl = (url) => {
  if (!url) return 'photo'
  try {
    const parts = url.split('/')
    return decodeURIComponent(parts[parts.length - 1])
  } catch {
    return 'photo'
  }
}

const MediaLibraryPage = () => {
  const { notify } = useNotification()
  const { data: eventsData, isLoading: eventsLoading } = useEvents()
  const deletePhotoMutation = useDeletePhoto()

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventFilter, setSelectedEventFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedPhotos, setSelectedPhotos] = useState(new Set())
  const [selectedPhotoDetail, setSelectedPhotoDetail] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 80

  // Get all events (axios wraps response in .data, API returns { data: [...] })
  const events = useMemo(() => {
    const list = eventsData?.data?.data
    if (!list) return []
    return Array.isArray(list) ? list : [list]
  }, [eventsData])

  // Flatten event -> album -> photo into a single photo list with context
  const allPhotos = useMemo(() => {
    const list = []
    events.forEach((event) => {
      (event.albums || []).forEach((album) => {
        (album.photos || []).forEach((photo) => {
          list.push({
            ...photo,
            fileName: getFileNameFromUrl(photo.imageUrl),
            albumName: album.albumName,
            eventName: event.title,
            eventId: event.id,
          })
        })
      })
    })
    return list
  }, [events])

  // Filter + search + sort
  const filteredAndSearchedPhotos = useMemo(() => {
    let result = allPhotos

    if (selectedEventFilter !== 'all') {
      result = result.filter((photo) => photo.eventId === selectedEventFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (photo) =>
          photo.fileName?.toLowerCase().includes(query) ||
          photo.albumName?.toLowerCase().includes(query) ||
          photo.eventName?.toLowerCase().includes(query)
      )
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [allPhotos, selectedEventFilter, searchQuery, sortBy])

  const totalPages = Math.ceil(filteredAndSearchedPhotos.length / PAGE_SIZE)
  const pagePhotos = useMemo(
    () => filteredAndSearchedPhotos.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filteredAndSearchedPhotos, page]
  )

  // Reset page when filter changes
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value)
    setPage(0)
  }, [])

  const handleEventFilter = useCallback((id) => {
    setSelectedEventFilter(id)
    setFilterOpen(false)
    setPage(0)
  }, [])

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value)
    setPage(0)
  }, [])

  // Handle photo selection
  const togglePhotoSelection = (photoId) => {
    const newSelected = new Set(selectedPhotos)
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId)
    } else {
      newSelected.add(photoId)
    }
    setSelectedPhotos(newSelected)
  }

  // Select all visible photos
  const toggleSelectAll = () => {
    if (selectedPhotos.size === filteredAndSearchedPhotos.length) {
      setSelectedPhotos(new Set())
    } else {
      setSelectedPhotos(new Set(filteredAndSearchedPhotos.map((p) => p.id)))
    }
  }

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedPhotos.size === 0) {
      notify.error('No photos selected')
      return
    }
    setIsDeleting(true)
    try {
      await Promise.all([...selectedPhotos].map((id) => deletePhotoMutation.mutateAsync(id)))
      notify.success(`Deleted ${selectedPhotos.size} photo(s)`)
      setSelectedPhotos(new Set())
      setShowDeleteModal(false)
    } catch {
      notify.error('Some photos could not be deleted. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle bulk download (direct browser download of each selected image)
  const handleBulkDownload = () => {
    if (selectedPhotos.size === 0) {
      notify.error('No photos selected')
      return
    }
    const photosToDownload = allPhotos.filter((p) => selectedPhotos.has(p.id))
    photosToDownload.forEach((photo, idx) => {
      setTimeout(() => {
        const link = document.createElement('a')
        link.href = photo.imageUrl
        link.download = photo.fileName || `photo-${photo.id}`
        link.target = '_blank'
        link.rel = 'noopener noreferrer'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }, idx * 200)
    })
    notify.success(`Downloading ${selectedPhotos.size} photo(s)...`)
  }

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-md py-lg">
        {/* Page Header */}
        <div className="mb-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-sm">Media Library</h1>
          <p className="text-gray-700">Manage all your uploaded photos and media assets in one place</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-lg">
          {[
            { label: 'Total Photos', value: allPhotos.length },
            { label: 'Total Events', value: events.length },
            { label: 'Selected', value: selectedPhotos.size, highlight: selectedPhotos.size > 0 },
          ].map((stat, idx) => (
            <div key={idx} className="p-md rounded-lg border bg-white border-neutral">
              <p className="text-sm text-gray-700 mb-sm">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.highlight ? 'text-accent' : 'text-gray-900'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-md border border-neutral mb-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search size={18} className="absolute left-md top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search by photo name, album, or event..."
                value={searchQuery}
                onChange={handleSearchChange}
                autoComplete="off"
                className="w-full pl-lg py-md border rounded-lg outline-none transition-colors bg-white border-neutral text-gray-900 placeholder-gray-500 focus:border-accent"
              />
            </div>

            {/* Event Filter */}
            <div className="relative w-full md:w-auto">
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className="w-full py-md px-lg border rounded-lg flex items-center justify-between gap-sm transition-all border-neutral bg-white text-gray-900 hover:border-accent"
              >
                <span className="font-medium truncate">
                  {selectedEventFilter === 'all' ? 'All Events' : events.find((e) => e.id === selectedEventFilter)?.title}
                </span>
                <ChevronDown size={20} className="flex-shrink-0" />
              </button>

              {filterOpen && (
                <div className="absolute top-full mt-sm left-0 right-0 z-20 rounded-lg border bg-white border-neutral shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      handleEventFilter('all')
                    }}
                    className={`w-full text-left px-lg py-md transition-colors ${
                      selectedEventFilter === 'all'
                        ? 'bg-accent text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    All Events
                  </button>
                  {events.map((event) => (
                    <button
                      type="button"
                      key={event.id}
                      onClick={() => {
                        handleEventFilter(event.id)
                      }}
                      className={`w-full text-left px-lg py-md transition-colors ${
                        selectedEventFilter === event.id
                          ? 'bg-accent text-white'
                          : 'hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      {event.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative w-full md:w-auto">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="w-full py-md px-lg border rounded-lg outline-none transition-colors bg-white border-neutral text-gray-900 focus:border-accent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPhotos.size > 0 && (
          <div className="bg-white rounded-lg p-md border border-accent mb-lg flex flex-wrap items-center justify-between gap-md">
            <span className="font-medium text-gray-900">
              {selectedPhotos.size} photo{selectedPhotos.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-md">
              <button
                type="button"
                onClick={handleBulkDownload}
                className="flex items-center gap-sm px-md py-sm bg-accent text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Download size={16} />
                Download
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-sm px-md py-sm bg-danger text-white rounded-md hover:bg-red-600 transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
              <button
                type="button"
                onClick={() => setSelectedPhotos(new Set())}
                className="px-md py-sm border border-neutral rounded-md hover:bg-gray-100 transition-colors text-gray-700"
                aria-label="Clear selection"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Photos Gallery */}
        {filteredAndSearchedPhotos.length > 0 ? (
          <div>
            {/* Select All */}
            <div className="mb-md flex items-center gap-md">
              <input
                type="checkbox"
                checked={selectedPhotos.size === filteredAndSearchedPhotos.length && filteredAndSearchedPhotos.length > 0}
                onChange={toggleSelectAll}
                className="w-5 h-5 accent-accent"
              />
              <span className="text-sm text-gray-700">
                {selectedPhotos.size === filteredAndSearchedPhotos.length ? 'Deselect' : 'Select'} All
              </span>
            </div>

            {/* Gallery Grid */}
            <div style={{ columnCount: 3, columnGap: '0.75rem', marginBottom: '2rem' }} className="sm:[column-count:4] lg:[column-count:5]">
              {pagePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="break-inside-avoid mb-3 relative group bg-white rounded-lg overflow-hidden border border-neutral hover:border-accent hover:shadow-md transition-all"
                >
                  <div className="relative">
                    {photo.imageUrl && (
                      <img
                        src={getCloudinaryThumb(photo.imageUrl, { w: 300, h: 300 })}
                        alt={photo.fileName}
                        className="w-full h-auto object-cover cursor-pointer"
                        loading="lazy"
                        onClick={() => setSelectedPhotoDetail(photo)}
                      />
                    )}

                    {/* Checkbox — top-right corner, always visible, click selects only */}
                    <div
                      className="absolute top-2 right-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPhotos.has(photo.id)}
                        onChange={() => togglePhotoSelection(photo.id)}
                        className="w-5 h-5 rounded accent-accent cursor-pointer border-2 border-white shadow"
                      />
                    </div>

                    {/* Hover overlay — click image to view details */}
                    <div
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-end justify-center pb-2 pointer-events-none"
                    >
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white bg-opacity-90 text-gray-900 px-2 py-0.5 rounded text-xs font-medium shadow">
                        Click photo to view
                      </span>
                    </div>
                  </div>

                  {/* Photo Info */}
                  <div className="px-2 py-1.5">
                    <p className="font-medium text-gray-900 text-xs truncate">{photo.fileName}</p>
                    <p className="text-xs text-gray-500 truncate">{photo.eventName} · {photo.albumName || 'Unorganized'}</p>
                  </div>
                </div>
              ))}
            </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 pb-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded-lg border border-neutral disabled:opacity-40 hover:bg-gray-50 transition-colors"><ChevronLeft size={16} /></button>
              <span className="text-sm text-gray-600">Page {page + 1} of {totalPages} &nbsp;·&nbsp; {filteredAndSearchedPhotos.length} photos</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-2 rounded-lg border border-neutral disabled:opacity-40 hover:bg-gray-50 transition-colors"><ChevronRight size={16} /></button>
            </div>
          )}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-lg bg-white rounded-lg border border-neutral text-center">
            <Grid size={48} className="text-gray-300 mb-md" />
            <h3 className="text-lg font-semibold text-gray-900 mb-sm">
              {allPhotos.length === 0 ? 'No Photos Available' : 'No Photos Match Your Search'}
            </h3>
            <p className="text-gray-700 mb-md">
              {allPhotos.length === 0
                ? 'Upload photos from an event album to start building your media library.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Delete Photos"
        message={`Are you sure you want to delete ${selectedPhotos.size} selected photo(s)? This action cannot be undone.`}
        isLoading={isDeleting}
      />

      {/* Photo Details Modal */}
      {selectedPhotoDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-md" onClick={() => setSelectedPhotoDetail(null)}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 flex items-center justify-between p-lg bg-white border-b border-neutral">
              <h2 className="text-lg font-semibold text-gray-900">Photo Details</h2>
              <button
                type="button"
                onClick={() => setSelectedPhotoDetail(null)}
                className="p-sm hover:bg-gray-100 rounded-md transition-colors text-gray-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-lg space-y-lg">
              {/* Photo Preview */}
              {selectedPhotoDetail.imageUrl && (
                <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedPhotoDetail.imageUrl}
                    alt={selectedPhotoDetail.fileName}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Photo Info */}
              <div className="space-y-md">
                <div>
                  <p className="text-sm text-gray-700 mb-sm">File Name</p>
                  <p className="text-gray-900 font-medium break-all">{selectedPhotoDetail.fileName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-700 mb-sm">Album</p>
                  <p className="text-gray-900 font-medium">{selectedPhotoDetail.albumName || 'Unorganized'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-700 mb-sm">Event</p>
                  <p className="text-gray-900 font-medium">{selectedPhotoDetail.eventName || '-'}</p>
                </div>

                {selectedPhotoDetail.createdAt && (
                  <div>
                    <p className="text-sm text-gray-700 mb-sm">Uploaded Date</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedPhotoDetail.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {selectedPhotoDetail.imageUrl && (
                  <div>
                    <p className="text-sm text-gray-700 mb-sm">URL</p>
                    <p className="text-xs text-accent break-all font-mono">{selectedPhotoDetail.imageUrl}</p>
                  </div>
                )}
              </div>

              <a
                href={selectedPhotoDetail.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-accent text-white px-lg py-sm rounded-md font-medium hover:bg-blue-600 transition-colors"
              >
                View Full Size
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaLibraryPage
