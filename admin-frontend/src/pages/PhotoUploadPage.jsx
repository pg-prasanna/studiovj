import React, { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  usePhotosByAlbum, useUploadPhotos, useUpdatePhotoOrientation,
  useDeletePhoto, useAlbumById,
} from '../hooks'
import { useModal } from '../hooks'
import {
  MasonryGallery, UploadManager, CropModal, Loading,
  DeleteConfirmModal, Alert,
} from '../components'
import { ChevronLeft, Image as ImageIcon } from 'lucide-react'
import { getErrorMessage } from '../utils/helpers'
import { useQueryClient } from '@tanstack/react-query'
import { photoAPI } from '../api/endpoints'

export const PhotoUploadPage = () => {
  const { albumId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: albumData, isLoading: albumLoading } = useAlbumById(albumId)
  const { data: photosData, isLoading: photosLoading } = usePhotosByAlbum(albumId)

  const uploadMutation = useUploadPhotos()
  const updateOrientationMutation = useUpdatePhotoOrientation()
  const deletePhotoMutation = useDeletePhoto()
  const deleteModal = useModal()
  const deleteBulkModal = useModal()

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectedPhotoId, setSelectedPhotoId] = useState(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [bulkDeleteList, setBulkDeleteList] = useState([])
  const [cropPhoto, setCropPhoto] = useState(null)
  const [isCropSaving, setIsCropSaving] = useState(false)

  const album = albumData?.data?.data
  const photos = photosData?.data?.data || []

  const invalidatePhotos = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['photos', String(albumId)] })
    queryClient.invalidateQueries({ queryKey: ['photos', Number(albumId)] })
    queryClient.invalidateQueries({ queryKey: ['events'] })
  }, [queryClient, albumId])

  const handleUploadPhotos = async (files, _onProgress, orientations = []) => {
    try {
      if (files.length === 0) { setError('Please select at least one image'); return }
      setError(null)
      const formData = new FormData()
      formData.append('albumId', albumId)
      files.forEach((file) => formData.append('files', file))
      files.forEach((_, i) => formData.append('orientations', orientations[i] || ''))
      await uploadMutation.mutateAsync(formData)
      setSuccess(`Successfully uploaded ${files.length} photo${files.length !== 1 ? 's' : ''}!`)
      setTimeout(() => setSuccess(null), 3000)
      invalidatePhotos()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleOrientationChange = async (orientation) => {
    if (!cropPhoto) return
    try {
      setError(null)
      await updateOrientationMutation.mutateAsync({ id: cropPhoto.id, orientation })
      setCropPhoto((prev) => prev ? { ...prev, orientation } : prev)
      invalidatePhotos()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const openCropModal = useCallback((photo) => {
    setError(null)
    setCropPhoto(photo)
  }, [])

  const handleDeletePhoto = async () => {
    try {
      setError(null)
      await deletePhotoMutation.mutateAsync(selectedPhotoId)
      setSuccess('Photo deleted successfully')
      setTimeout(() => setSuccess(null), 3000)
      deleteModal.close()
      invalidatePhotos()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const handleBulkDelete = async () => {
    try {
      setError(null)
      await Promise.all(bulkDeleteList.map((photoId) => deletePhotoMutation.mutateAsync(photoId)))
      setSuccess(`Successfully deleted ${bulkDeleteList.length} photo${bulkDeleteList.length !== 1 ? 's' : ''}`)
      setTimeout(() => setSuccess(null), 3000)
      deleteBulkModal.close()
      setSelectedPhotos([])
      setIsSelectionMode(false)
      invalidatePhotos()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const openBulkDeleteModal = () => {
    setBulkDeleteList(selectedPhotos)
    deleteBulkModal.open()
  }

  const handleSaveCroppedPhoto = async (blob) => {
    if (!cropPhoto) return
    try {
      setIsCropSaving(true)
      setError(null)
      const filename = cropPhoto.imageUrl?.split('/').pop()?.split('?')[0] || `photo-${cropPhoto.id}.jpg`
      const croppedFile = new File([blob], filename, { type: blob.type || 'image/jpeg' })
      const formData = new FormData()
      formData.append('albumId', albumId)
      formData.append('files', croppedFile)
      formData.append('orientations', cropPhoto.orientation || '')
      await uploadMutation.mutateAsync(formData)
      await deletePhotoMutation.mutateAsync(cropPhoto.id)
      setSuccess('Photo updated successfully')
      setTimeout(() => setSuccess(null), 3000)
      setCropPhoto(null)
      invalidatePhotos()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsCropSaving(false)
    }
  }

  const openDeleteModal = (photoId) => {
    setSelectedPhotoId(photoId)
    deleteModal.open()
  }

  const handleEditScreenDelete = () => {
    if (!cropPhoto) return
    openDeleteModal(cropPhoto.id)
    setCropPhoto(null)
  }

  // Photo drag-and-drop reorder
  const handleReorder = useCallback(async (reorderedPhotos) => {
    try {
      const orderedIds = reorderedPhotos.map((p) => p.id)
      await photoAPI.reorder(albumId, orderedIds)
      invalidatePhotos()
    } catch (err) {
      setError('Failed to save photo order: ' + getErrorMessage(err))
      throw err
    }
  }, [albumId, invalidatePhotos])

  if (albumLoading || photosLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-lg animate-fade-in">
      {/* Header */}
      <div className="mb-lg">
        <div className="flex items-center gap-md mb-md">
          <button
            onClick={() => navigate(-1)}
            className="p-sm text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{album?.albumName}</h1>
            <p className="text-gray-600 text-sm mt-1">Manage and upload photos to this album</p>
          </div>
          <div className="flex gap-2">
            {photos.length > 0 && !isSelectionMode && (
              <button
                onClick={() => setIsSelectionMode(true)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
              >
                Select Photos
              </button>
            )}
            {isSelectionMode && (
              <button
                onClick={() => { setIsSelectionMode(false); setSelectedPhotos([]) }}
                className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              >
                Exit Selection
              </button>
            )}
          </div>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Total Photos</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{photos.length}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">First Uploaded</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {new Date(photos[photos.length - 1]?.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 text-sm font-medium">Most Recent</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {new Date(photos[0]?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <Alert type="error" title="Error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" title="Success" message={success} onClose={() => setSuccess(null)} />}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Photos</h2>
        <UploadManager onUploadFiles={handleUploadPhotos} isUploading={uploadMutation.isPending} />
      </div>

      {photos.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo Gallery</h2>
          <MasonryGallery
            photos={photos}
            isLoading={photosLoading}
            onPhotoClick={openCropModal}
            onPhotoDelete={openDeleteModal}
            onPhotoSelect={setSelectedPhotos}
            onBulkDelete={openBulkDeleteModal}
            selectedPhotos={selectedPhotos}
            showSelection={isSelectionMode}
            onReorder={handleReorder}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-200">
          <ImageIcon size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-700 font-semibold mb-2">No Photos Yet</p>
          <p className="text-gray-600 text-sm">Upload photos above to start building your gallery</p>
        </div>
      )}

      <CropModal
        source={cropPhoto?.imageUrl || null}
        filename={cropPhoto?.imageUrl?.split('/').pop()?.split('?')[0]}
        isOpen={!!cropPhoto}
        onClose={() => !isCropSaving && setCropPhoto(null)}
        onSave={handleSaveCroppedPhoto}
        isSaving={isCropSaving}
        title="Edit photo"
        orientation={cropPhoto?.orientation}
        onOrientationChange={handleOrientationChange}
        onDelete={handleEditScreenDelete}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDeletePhoto}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={deleteBulkModal.isOpen}
        onClose={deleteBulkModal.close}
        onConfirm={handleBulkDelete}
        title="Delete Multiple Photos"
        message={`Delete ${bulkDeleteList.length} photo${bulkDeleteList.length !== 1 ? 's' : ''}? This action cannot be undone.`}
      />
    </div>
  )
}
