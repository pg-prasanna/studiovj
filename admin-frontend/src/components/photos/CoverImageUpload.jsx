import React, { useState, useRef, useEffect } from 'react'
import { Upload, Crop, X } from 'lucide-react'
import { isValidFile } from '../../utils/helpers'
import { COVER_ASPECT_RATIO, COVER_ASPECT_LABEL } from '../../utils/cropUtils'
import { CropModal } from './CropModal'

let coverInputCounter = 0

/**
 * Cover image upload field for events. Every cover is cropped to the same
 * fixed aspect ratio (COVER_ASPECT_RATIO) before it's staged for upload —
 * this guarantees every event cover renders identically wherever it's
 * displayed on the public site, with no stretching or inconsistent crops.
 *
 * onFileReady(file | null) is called with the final cropped File.
 */
export const CoverImageUpload = ({ onFileReady, error }) => {
  const [rawFile, setRawFile] = useState(null) // file pending crop
  const [croppedFile, setCroppedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const dragCounterRef = useRef(0)
  const inputId = useRef(`cover-upload-input-${++coverInputCounter}`).current

  useEffect(() => {
    if (!croppedFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(croppedFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [croppedFile])

  const handleFile = (file) => {
    if (!file || !isValidFile(file).valid) return
    setRawFile(file)
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0])
      e.target.value = ''
    }
  }

  const handleDragEnter = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounterRef.current += 1
    setIsDragActive(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault(); e.stopPropagation()
    dragCounterRef.current -= 1
    if (dragCounterRef.current === 0) setIsDragActive(false)
  }
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation() }
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragActive(false)
    dragCounterRef.current = 0
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const handleCropSave = async (blob) => {
    const filename = rawFile?.name?.replace(/\.[^.]+$/, '.jpg') || 'cover.jpg'
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' })
    setCroppedFile(file)
    setRawFile(null)
    onFileReady(file)
  }

  const handleRemove = () => {
    setCroppedFile(null)
    onFileReady(null)
  }

  return (
    <div className="space-y-md">
      {!croppedFile && (
        <>
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleInputChange}
            style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden', zIndex: -1 }}
          />
          <label
            htmlFor={inputId}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            style={{ display: 'block', cursor: 'pointer' }}
            className={`
              border-2 border-dashed rounded-lg p-2xl text-center transition-colors select-none
              ${isDragActive ? 'border-accent bg-blue-50' : 'border-neutral hover:border-secondary'}
              ${error ? 'border-danger' : ''}
            `}
          >
            <Upload size={40} className="mx-auto mb-md text-gray-700" />
            <p className="text-gray-900 font-medium mb-xs">
              {isDragActive ? 'Drop image here' : 'Drag and drop an image here'}
            </p>
            <p className="text-sm text-gray-700 mb-md">or click to select a file</p>
            <p className="text-xs text-gray-700">
              JPG, PNG, GIF, WebP (max 50MB) · cropped to {COVER_ASPECT_LABEL} for a consistent cover
            </p>
          </label>
        </>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      {croppedFile && previewUrl && (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200">
          <img
            src={previewUrl}
            alt="Cover preview"
            className="w-full object-cover"
            style={{ aspectRatio: COVER_ASPECT_RATIO }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => setRawFile(croppedFile)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Crop size={15} /> Re-crop
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <X size={15} /> Remove
            </button>
          </div>
        </div>
      )}

      <CropModal
        source={rawFile}
        filename={rawFile?.name}
        isOpen={!!rawFile}
        onClose={() => setRawFile(null)}
        onSave={handleCropSave}
        lockedAspect={COVER_ASPECT_RATIO}
        title="Crop cover image"
      />
    </div>
  )
}
