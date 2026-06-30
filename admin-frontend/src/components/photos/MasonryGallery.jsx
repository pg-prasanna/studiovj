import React, { useState, useMemo, useCallback, memo, useRef } from 'react'
import {
  ChevronDown, Search, Grid, Trash2, Check, Pencil,
  ChevronLeft, ChevronRight, MoreVertical, Eye, GripVertical,
} from 'lucide-react'
import { cn, sortPhotosByDate, filterPhotosByQuery, getCloudinaryThumb } from '../../utils/helpers'

const PAGE_SIZE = 60

// ─── Three-dot menu ──────────────────────────────────────────────────────────
const PhotoMenu = memo(({ photo, onEdit, onViewFull, onDelete, onClose }) => {
  return (
    <div
      className="absolute top-8 right-1 z-30 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[130px]"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => { onEdit(photo); onClose() }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <Pencil size={14} /> Edit
      </button>
      <button
        onClick={() => { onViewFull(photo); onClose() }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <Eye size={14} /> View Full Size
      </button>
      <button
        onClick={() => { onDelete(photo.id); onClose() }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  )
})
PhotoMenu.displayName = 'PhotoMenu'

// ─── Single photo tile ────────────────────────────────────────────────────────
const PhotoTile = memo(({
  photo, isSelected, showSelection, onClick, onEdit, onViewFull, onDelete,
  draggable, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver,
}) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const fallbackRatio = { PORTRAIT: 3 / 4, LANDSCAPE: 4 / 3, SQUARE: 1 }
  const ratio =
    photo.width && photo.height
      ? photo.width / photo.height
      : fallbackRatio[photo.orientation] || 4 / 3
  const thumbSrc = getCloudinaryThumb(photo.imageUrl, { w: 400, h: 400 })

  const handleMenuToggle = (e) => {
    e.stopPropagation()
    setMenuOpen((v) => !v)
  }

  return (
    <div
      className={cn(
        'group relative mb-3 break-inside-avoid cursor-pointer select-none',
        isDragOver && 'ring-2 ring-blue-400 rounded-lg scale-[1.02]'
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden rounded-lg bg-gray-100 ring-1 ring-black/5"
        style={{ aspectRatio: ratio }}
      >
        <img
          src={thumbSrc}
          alt="Gallery photo"
          className="w-full h-full object-cover group-hover:scale-[1.03] group-hover:brightness-90 transition-transform duration-200"
          loading="lazy"
          decoding="async"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none" />

        {/* Checkbox (top-left) — shown on hover or when selection mode active */}
        <div
          className={cn(
            'absolute top-2 left-2 transition-opacity duration-150',
            showSelection || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
          onClick={(e) => { e.stopPropagation(); onClick() }}
        >
          <div
            className={cn(
              'w-6 h-6 rounded border-2 flex items-center justify-center shadow',
              isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white/90 border-gray-300'
            )}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            {isSelected && <Check size={14} className="text-white" />}
          </div>
        </div>

        {/* Three-dot button (top-right) — inside image for positioning */}
        {!showSelection && (
          <div
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleMenuToggle}
              className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors"
            >
              <MoreVertical size={14} />
            </button>
          </div>
        )}

        {/* Drag handle hint */}
        {draggable && !showSelection && (
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-60 transition-opacity pointer-events-none">
            <GripVertical size={14} className="text-white" />
          </div>
        )}
      </div>

      {/* Three-dot dropdown menu — outside overflow:hidden so it never gets clipped */}
      {!showSelection && menuOpen && (
        <div
          className="absolute top-9 right-1 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <PhotoMenu
            photo={photo}
            onEdit={onEdit}
            onViewFull={onViewFull}
            onDelete={onDelete}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}
    </div>
  )
})
PhotoTile.displayName = 'PhotoTile'

// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = memo(({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-600 px-2">Page {page + 1} of {totalPages}</span>
      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages - 1}
        className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
})
Pagination.displayName = 'Pagination'

// ─── Main MasonryGallery ──────────────────────────────────────────────────────
export const MasonryGallery = ({
  photos = [],
  isLoading = false,
  onPhotoClick,       // open edit/crop
  onPhotoDelete,      // single delete
  onPhotoSelect,
  onBulkDelete,
  selectedPhotos = [],
  showSelection = false,
  // Reorder props
  onReorder,          // (reorderedPhotos) => void — called after drop
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('display')
  const [page, setPage] = useState(0)
  const [localPhotos, setLocalPhotos] = useState(null)
  const dragIdxRef = useRef(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  // Use localPhotos for drag-and-drop, fall back to props
  const displayPhotos = localPhotos !== null ? localPhotos : photos

  // Sync when photos prop changes (after server save)
  React.useEffect(() => {
    setLocalPhotos(null)
  }, [photos])

  const filteredPhotos = useMemo(() => {
    let list = filterPhotosByQuery(displayPhotos, searchQuery)
    if (sortOrder === 'newest') list = sortPhotosByDate(list, 'newest')
    else if (sortOrder === 'oldest') list = sortPhotosByDate(list, 'oldest')
    else list = [...list].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    return list
  }, [displayPhotos, searchQuery, sortOrder])

  const totalPages = Math.ceil(filteredPhotos.length / PAGE_SIZE)
  const pagePhotos = useMemo(
    () => filteredPhotos.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [filteredPhotos, page]
  )

  const isAllSelected = filteredPhotos.length > 0 && selectedPhotos.length === filteredPhotos.length
  const isPartiallySelected = selectedPhotos.length > 0 && selectedPhotos.length < filteredPhotos.length

  const toggleSelectAll = useCallback(() => {
    if (isAllSelected) onPhotoSelect([])
    else onPhotoSelect(filteredPhotos.map((p) => p.id))
  }, [isAllSelected, filteredPhotos, onPhotoSelect])

  const togglePhotoSelect = useCallback((photoId) => {
    if (selectedPhotos.includes(photoId)) {
      onPhotoSelect(selectedPhotos.filter((id) => id !== photoId))
    } else {
      onPhotoSelect([...selectedPhotos, photoId])
    }
  }, [selectedPhotos, onPhotoSelect])

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value)
    setPage(0)
  }, [])

  // Drag-and-drop reorder
  const handleDragStart = useCallback((e, idx) => {
    dragIdxRef.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIdx(idx)
  }, [])

  const handleDrop = useCallback(async (e, dropIdx) => {
    e.preventDefault()
    const dragIdx = dragIdxRef.current
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragOverIdx(null)
      dragIdxRef.current = null
      return
    }
    const reordered = [...filteredPhotos]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(dropIdx, 0, moved)

    // Assign new displayOrder values
    const withOrder = reordered.map((p, i) => ({ ...p, displayOrder: i }))
    setLocalPhotos(withOrder)
    setDragOverIdx(null)
    dragIdxRef.current = null

    if (onReorder) {
      try {
        await onReorder(withOrder)
      } catch {
        setLocalPhotos(null)
      }
    }
  }, [filteredPhotos, onReorder])

  const handleDragEnd = useCallback(() => {
    setDragOverIdx(null)
    dragIdxRef.current = null
  }, [])

  const handleViewFull = useCallback((photo) => {
    window.open(photo.imageUrl, '_blank')
  }, [])

  if (isLoading) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="mb-3 break-inside-avoid aspect-square bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Grid size={48} className="text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium mb-2">No photos yet</p>
        <p className="text-gray-400 text-sm">Upload photos to start building your gallery</p>
      </div>
    )
  }

  const canReorder = !!onReorder && sortOrder === 'display' && !searchQuery

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-gray-600">
          {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''}
          {selectedPhotos.length > 0 && ` · ${selectedPhotos.length} selected`}
        </span>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search photos..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-44 pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <select
            value={sortOrder}
            onChange={(e) => { setSortOrder(e.target.value); setPage(0) }}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 hover:bg-gray-50"
          >
            <option value="display">Custom Order</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          {showSelection && selectedPhotos.length > 0 && onBulkDelete && (
            <button
              onClick={() => onBulkDelete(selectedPhotos)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
            >
              <Trash2 size={15} />
              Delete ({selectedPhotos.length})
            </button>
          )}
        </div>
      </div>

      {/* Select-all bar */}
      {showSelection && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => { if (el) el.indeterminate = isPartiallySelected }}
            onChange={toggleSelectAll}
            className="w-5 h-5 cursor-pointer"
          />
          <span className="text-sm font-medium text-blue-900">
            {selectedPhotos.length > 0
              ? `${selectedPhotos.length} photo${selectedPhotos.length !== 1 ? 's' : ''} selected`
              : 'Select photos'}
          </span>
          {selectedPhotos.length > 0 && (
            <button onClick={() => onPhotoSelect([])} className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium">
              Clear
            </button>
          )}
        </div>
      )}

      {canReorder && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <GripVertical size={13} /> Drag photos to reorder. Order is saved automatically.
        </p>
      )}

      {/* Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3">
        {pagePhotos.map((photo, idx) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            isSelected={selectedPhotos.includes(photo.id)}
            showSelection={showSelection}
            onClick={() => togglePhotoSelect(photo.id)}
            onEdit={onPhotoClick}
            onViewFull={handleViewFull}
            onDelete={onPhotoDelete}
            draggable={canReorder}
            onDragStart={(e) => handleDragStart(e, page * PAGE_SIZE + idx)}
            onDragOver={(e) => handleDragOver(e, page * PAGE_SIZE + idx)}
            onDrop={(e) => handleDrop(e, page * PAGE_SIZE + idx)}
            onDragEnd={handleDragEnd}
            isDragOver={dragOverIdx === page * PAGE_SIZE + idx}
          />
        ))}
      </div>

      {filteredPhotos.length === 0 && photos.length > 0 && (
        <p className="text-center py-8 text-gray-500">No photos match your search</p>
      )}

      <Pagination page={page} totalPages={totalPages} onPage={handlePageChange} />
    </div>
  )
}
