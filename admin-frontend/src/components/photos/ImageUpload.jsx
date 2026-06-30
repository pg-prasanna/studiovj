import React, { useState, useEffect, useRef } from 'react'
import { isValidFile } from '../../utils/helpers'
import { Upload, X } from 'lucide-react'

let inputCounter = 0

export const ImageUploadField = ({ onFilesSelect, multiple = false, error, maxFiles = 10 }) => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [isDragActive, setIsDragActive] = useState(false)
  const dragCounterRef = useRef(0)
  // Unique id per instance so multiple fields on same page don't conflict
  const inputId = useRef(`image-upload-input-${++inputCounter}`).current

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => { urls.forEach((url) => URL.revokeObjectURL(url)) }
  }, [selectedFiles])

  const addFiles = (rawFiles) => {
    const files = Array.from(rawFiles)
    const validFiles = files.filter((file) => isValidFile(file).valid)
    if (validFiles.length === 0) return
    const newFiles = multiple
      ? selectedFiles.concat(validFiles).slice(0, maxFiles)
      : validFiles.slice(0, 1)
    setSelectedFiles(newFiles)
    onFilesSelect(newFiles)
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files)
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
      addFiles(e.dataTransfer.files)
      e.dataTransfer.clearData()
    }
  }

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
    onFilesSelect(newFiles)
  }

  return (
    <div className="space-y-md">
      {/*
        CRITICAL: <input type="file"> triggered via <label htmlFor> only.
        Never use ref.click() from a div onClick — Chrome treats it as
        untrusted and freezes ("Not Responding") waiting for focus return.
      */}
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/bmp"
        onChange={handleInputChange}
        style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, overflow: 'hidden', zIndex: -1 }}
      />

      {/* label = native trusted click → no Chrome freeze */}
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
          {isDragActive ? 'Drop images here' : 'Drag and drop images here'}
        </p>
        <p className="text-sm text-gray-700 mb-md">or click to select files</p>
        <p className="text-xs text-gray-700">Supported formats: JPG, PNG, GIF, WebP (max 50MB)</p>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      {selectedFiles.length > 0 && (
        <div className="space-y-sm">
          <p className="text-sm font-medium text-gray-900">
            Selected: {selectedFiles.length} {selectedFiles.length === 1 ? 'image' : 'images'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {selectedFiles.map((file, index) => (
              <div key={index} className="relative group">
                {previewUrls[index] && (
                  <img src={previewUrls[index]} alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded-md bg-neutral" />
                )}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(index) }}
                  className="absolute top-1 right-1 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
                <p className="text-xs text-gray-700 mt-xs truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export const ImageUploadProgress = ({ fileName, progress }) => (
  <div className="space-y-sm">
    <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
    <div className="w-full bg-neutral rounded-full h-2">
      <div className="bg-accent h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }} />
    </div>
    <p className="text-xs text-gray-700">{progress}%</p>
  </div>
)
