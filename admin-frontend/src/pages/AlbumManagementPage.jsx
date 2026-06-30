import React, { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAlbumsByEvent, useCreateAlbum, useDeleteAlbum, useUpdateAlbum, useEventById, useReorderAlbums } from '../hooks'
import { useModal } from '../hooks'
import { AlbumCard, AlbumForm, Modal, Loading, DeleteConfirmModal, Alert, SkeletonGrid } from '../components'
import { Plus, ChevronLeft, Camera, GripVertical } from 'lucide-react'
import { getErrorMessage } from '../utils/helpers'

export const AlbumManagementPage = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const { data: eventData, isLoading: eventLoading } = useEventById(eventId)
  const { data: albumsData, isLoading: albumsLoading } = useAlbumsByEvent(eventId)
  const createModal = useModal()
  const editModal = useModal()
  const deleteModal = useModal()
  
  const [selectedAlbumId, setSelectedAlbumId] = useState(null)
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [error, setError] = useState(null)
  const [localAlbums, setLocalAlbums] = useState(null)
  const dragIdxRef = useRef(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)

  const createMutation = useCreateAlbum()
  const updateMutation = useUpdateAlbum(selectedAlbumId)
  const deleteMutation = useDeleteAlbum()
  const reorderMutation = useReorderAlbums(eventId)

  const rawAlbums = albumsData?.data?.data || []
  const albums = localAlbums !== null ? localAlbums : rawAlbums
  const event = eventData?.data?.data

  useEffect(() => {
    if (rawAlbums.length > 0 && localAlbums === null) {
      setLocalAlbums(rawAlbums)
    }
    if (rawAlbums.length !== (localAlbums || []).length) {
      setLocalAlbums(rawAlbums)
    }
  }, [albumsData])

  const handleCreateAlbum = async (formData) => {
    try {
      setError(null)
      await createMutation.mutateAsync({ ...formData, eventId: parseInt(eventId) })
      setLocalAlbums(null)
      createModal.close()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleEditAlbum = (album) => {
    setSelectedAlbumId(album.id)
    setEditingAlbum(album)
    editModal.open()
  }

  const handleUpdateAlbum = async (formData) => {
    try {
      setError(null)
      await updateMutation.mutateAsync(formData)
      editModal.close()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleDeleteAlbum = async () => {
    try {
      setError(null)
      await deleteMutation.mutateAsync(selectedAlbumId)
      setLocalAlbums(null)
      deleteModal.close()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const openDeleteModal = (albumId) => {
    setSelectedAlbumId(albumId)
    deleteModal.open()
  }

  const handleDragStart = (e, idx) => {
    dragIdxRef.current = idx
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, idx) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIdx(idx)
  }

  const handleDrop = async (e, dropIdx) => {
    e.preventDefault()
    const dragIdx = dragIdxRef.current
    if (dragIdx === null || dragIdx === dropIdx) {
      setDragOverIdx(null)
      dragIdxRef.current = null
      return
    }
    const reordered = [...albums]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(dropIdx, 0, moved)
    setLocalAlbums(reordered)
    setDragOverIdx(null)
    dragIdxRef.current = null
    try {
      await reorderMutation.mutateAsync(reordered.map((a) => a.id))
    } catch (err) {
      setError('Failed to save album order: ' + getErrorMessage(err))
      setLocalAlbums(rawAlbums)
    }
  }

  const handleDragEnd = () => {
    setDragOverIdx(null)
    dragIdxRef.current = null
  }

  if (eventLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-lg animate-fade-in">
      <div className="mb-lg">
        <div className="flex items-center gap-md mb-md">
          <button
            onClick={() => navigate('/events')}
            className="p-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{event?.title}</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and organize albums for this event</p>
          </div>
          <button
            onClick={createModal.open}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Create Album
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total Albums</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{albums.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Event Date</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {event?.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />
      )}

      {albumsLoading ? (
        <SkeletonGrid cols={3} />
      ) : albums.length > 0 ? (
        <>
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
            <GripVertical size={13} /> Drag album cards to reorder. Order is saved automatically.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {albums.map((album, idx) => (
              <div
                key={album.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`relative cursor-grab active:cursor-grabbing transition-all duration-150 ${
                  dragOverIdx === idx ? 'ring-2 ring-blue-400 scale-[1.02]' : ''
                }`}
              >
                <div className="absolute top-2 left-2 z-10 text-white/70 drop-shadow pointer-events-none">
                  <GripVertical size={16} />
                </div>
                <AlbumCard
                  album={album}
                  photos={[]}
                  onEdit={handleEditAlbum}
                  onDelete={openDeleteModal}
                  onPhotos={(id) => navigate('/albums/' + id + '/photos')}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <Camera size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-700 font-semibold mb-2">No Albums Yet</p>
          <p className="text-gray-600 text-sm mb-6">Create your first album to start organizing photos</p>
          <button
            onClick={createModal.open}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Album
          </button>
        </div>
      )}

      <Modal isOpen={createModal.isOpen} onClose={createModal.close} title="Create New Album">
        <AlbumForm onSubmit={handleCreateAlbum} isLoading={createMutation.isPending} />
      </Modal>

      <Modal isOpen={editModal.isOpen} onClose={editModal.close} title="Edit Album">
        <AlbumForm onSubmit={handleUpdateAlbum} initialData={editingAlbum} isLoading={updateMutation.isPending} />
      </Modal>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeleteAlbum}
        title="Delete Album"
        message="This will delete the album and all its photos. This action cannot be undone."
      />
    </div>
  )
}
