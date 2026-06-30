import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Upload, X, CheckCircle, AlertCircle, Loader, Square, Crop as CropIcon,
} from 'lucide-react'
import { formatFileSize, getImageMeta, ORIENTATIONS } from '../../utils/helpers'
import { prepareFilesForUpload } from '../../utils/imageCompress'
import { CropModal } from './CropModal'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
const MAX_SIZE = 50 * 1024 * 1024

const OrientationIcon = ({ orientation, size = 14, className = '' }) => {
  const style =
    orientation === 'PORTRAIT'
      ? { width: size * 0.6, height: size }
      : orientation === 'LANDSCAPE'
      ? { width: size, height: size * 0.6 }
      : { width: size * 0.8, height: size * 0.8 }
  return <Square className={className} style={style} strokeWidth={2.5} />
}

export const UploadManager = ({ onUploadFiles, isUploading = false, maxFiles = 100 }) => {
  const [uploadQueue, setUploadQueue] = useState([])
  const [isDragActive, setIsDragActive] = useState(false)
  const [cropTargetId, setCropTargetId] = useState(null)
  const dragCounterRef = useRef(0)
  const inputId = 'upload-manager-input'

  useEffect(() => {
    return () => {
      uploadQueue.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = useCallback((rawFiles) => {
    const files = Array.from(rawFiles)
    const valid = files.filter((f) => ACCEPTED_TYPES.includes(f.type) && f.size <= MAX_SIZE)
    if (valid.length === 0) return
    const toAdd = valid.slice(0, maxFiles - uploadQueue.length)
    const entries = toAdd.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      progress: 0,
      error: null,
      width: null,
      height: null,
      orientation: null,
      orientationOverride: null,
    }))
    setUploadQueue((prev) => [...prev, ...entries])

    entries.forEach((entry) => {
      getImageMeta(entry.file).then(({ width, height, orientation }) => {
        setUploadQueue((prev) =>
          prev.map((item) =>
            item.id === entry.id ? { ...item, width, height, orientation } : item
          )
        )
      })
    })
  }, [uploadQueue.length, maxFiles])

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
      e.target.value = ''
    }
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragActive(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    dragCounterRef.current += 1
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) setIsDragActive(false)
  }, [])

  const handleDragOver = useCallback((e) => { e.preventDefault() }, [])

  const removeItem = useCallback((id) => {
    setUploadQueue((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const setOrientationOverride = useCallback((id, orientation) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, orientationOverride: orientation } : item
      )
    )
  }, [])

  const cropTarget = uploadQueue.find((i) => i.id === cropTargetId) || null

  const handleCropSave = useCallback((blob) => {
    if (!cropTarget) return
    const croppedFile = new File([blob], cropTarget.file.name, { type: blob.type || 'image/jpeg' })
    const newPreview = URL.createObjectURL(blob)
    URL.revokeObjectURL(cropTarget.previewUrl)
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === cropTargetId
          ? { ...item, file: croppedFile, previewUrl: newPreview }
          : item
      )
    )
    setCropTargetId(null)
  }, [cropTarget, cropTargetId])

  const handleUpload = async () => {
    const pending = uploadQueue.filter((i) => i.status === 'pending')
    if (pending.length === 0 || isUploading) return

    // Mark all pending as uploading
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.status === 'pending' ? { ...item, status: 'uploading' } : item
      )
    )

    try {
      // Compress files before upload (mirrors CloudinaryService.prepareBytes)
      const results = await prepareFilesForUpload(pending.map((i) => i.file))

      const compressedFiles = []
      const orientations = []
      const failedIds = []

      results.forEach((result, idx) => {
        if (result.error) {
          failedIds.push(pending[idx].id)
        } else {
          compressedFiles.push(result.file)
          const item = pending[idx]
          orientations.push(item.orientationOverride || item.orientation || '')
        }
      })

      // Mark compression failures
      if (failedIds.length > 0) {
        setUploadQueue((prev) =>
          prev.map((item) =>
            failedIds.includes(item.id)
              ? { ...item, status: 'error', error: 'Could not compress below 10 MB' }
              : item
          )
        )
      }

      if (compressedFiles.length > 0) {
        await onUploadFiles(compressedFiles, () => {}, orientations)
        setUploadQueue((prev) =>
          prev.filter((item) => item.status !== 'uploading')
        )
      }
    } catch (err) {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.status === 'uploading'
            ? { ...item, status: 'error', error: err.message }
            : item
        )
      )
    }
  }

  const pendingCount = uploadQueue.filter((i) => i.status === 'pending').length
  const errorCount = uploadQueue.filter((i) => i.status === 'error').length
  const totalBytes = uploadQueue.filter((i) => i.status === 'pending').reduce((sum, i) => sum + i.file.size, 0)
  const totalSizeLabel = totalBytes > 0 ? (totalBytes >= 1024 * 1024 ? (totalBytes / (1024 * 1024)).toFixed(1) + ' MB' : (totalBytes / 1024).toFixed(0) + ' KB') : null

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <label
        htmlFor={inputId}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer block ${
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          id={inputId}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
        <Upload size={36} className="mx-auto mb-3 text-gray-400" />
        <p className="text-gray-700 font-medium mb-1">
          Drag & drop photos here or{' '}
          <span className="text-blue-600 cursor-pointer hover:underline">
            browse files
          </span>
        </p>
        <p className="text-xs text-gray-400">
          JPEG, PNG, WebP, GIF up to 50 MB · Images are compressed client-side before upload
        </p>
      </label>

      {/* Queue */}
      {uploadQueue.length > 0 && (
        <div className="space-y-2">
          {uploadQueue.map((item) => {
            const effectiveOrientation = item.orientationOverride || item.orientation || 'LANDSCAPE'
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <img
                  src={item.previewUrl}
                  alt=""
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
                  {item.error && (
                    <p className="text-xs text-red-600 mt-0.5">{item.error}</p>
                  )}
                </div>

                {/* Orientation override */}
                {item.status === 'pending' && (
                  <select
                    value={item.orientationOverride || ''}
                    onChange={(e) => setOrientationOverride(item.id, e.target.value || null)}
                    className="text-xs border border-gray-300 rounded px-1 py-0.5"
                  >
                    <option value="">Auto</option>
                    {ORIENTATIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                )}

                {/* Crop button */}
                {item.status === 'pending' && (
                  <button
                    onClick={() => setCropTargetId(item.id)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Crop"
                  >
                    <CropIcon size={16} />
                  </button>
                )}

                {/* Status icon */}
                {item.status === 'uploading' && <Loader size={18} className="text-blue-500 animate-spin shrink-0" />}
                {item.status === 'done' && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                {item.status === 'error' && <AlertCircle size={18} className="text-red-500 shrink-0" />}

                {/* Remove */}
                {item.status !== 'uploading' && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Actions */}
      {totalSizeLabel && (
        <p className="text-xs text-gray-500 text-right -mt-1">
          Total: <span className="font-medium">{totalSizeLabel}</span>
        </p>
      )}

      {pendingCount > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isUploading ? 'Uploading…' : `Upload ${pendingCount} photo${pendingCount !== 1 ? 's' : ''}`}
        </button>
      )}

      {errorCount > 0 && (
        <button
          onClick={() => setUploadQueue((prev) => prev.filter((i) => i.status !== 'error'))}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Clear {errorCount} error{errorCount !== 1 ? 's' : ''}
        </button>
      )}

      {/* Crop modal for pre-upload cropping */}
      <CropModal
        source={cropTarget?.previewUrl || null}
        filename={cropTarget?.file?.name}
        isOpen={!!cropTarget}
        onClose={() => setCropTargetId(null)}
        onSave={handleCropSave}
        isSaving={false}
        title="Crop before upload"
      />
    </div>
  )
}
