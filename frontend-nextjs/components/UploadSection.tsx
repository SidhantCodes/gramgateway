'use client'

import { useState, useCallback } from 'react'
import { useAppStore } from '@/store/appStore'
import { Upload, FileImage, Wand2 } from 'lucide-react'

export default function UploadSection() {
  const { uploadAndProcessImage, isLoading } = useAppStore()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [watermark, setWatermark] = useState('©PnC')
  const [fileError, setFileError] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (file: File) => {
    setFileError(null)
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size must be less than 10MB')
      return
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setFileError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
      return
    }
    
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.onerror = () => {
      setFileError('Error reading file')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!selectedFile) return
    
    const success = await uploadAndProcessImage(selectedFile, caption || undefined, watermark)
    if (success) {
      setSelectedFile(null)
      setPreview(null)
      setCaption('')
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Upload className="w-6 h-6" />
        Upload & Process Image
      </h2>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-instagram-blue bg-blue-50'
            : 'border-gray-300 hover:border-instagram-blue'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-w-xs max-h-64 rounded-lg shadow-lg"
            />
            <p className="text-sm text-gray-600">{selectedFile?.name}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <FileImage className="w-16 h-16 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop your image here or{' '}
                <label className="text-instagram-blue cursor-pointer hover:underline">
                  browse files
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">PNG, JPG, JPEG, GIF, WebP up to 10MB</p>
            </div>
          </div>
        )}
        
        {fileError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{fileError}</p>
          </div>
        )}
      </div>

      {/* Caption Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Caption (optional - AI will generate if empty)
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-instagram-blue focus:border-transparent"
          rows={3}
          placeholder="Enter your Instagram caption or leave empty for AI generation..."
        />
      </div>

      {/* Watermark Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Watermark Text
        </label>
        <input
          type="text"
          value={watermark}
          onChange={(e) => setWatermark(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-instagram-blue focus:border-transparent"
          placeholder="Watermark text"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        className="w-full bg-instagram-gradient text-white py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="spinner w-5 h-5" />
            Processing...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Process Image
          </>
        )}
      </button>
    </div>
  )
}
