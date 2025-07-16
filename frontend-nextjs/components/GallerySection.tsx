'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Image, RefreshCw, Instagram, Trash2 } from 'lucide-react'

export default function GallerySection() {
  const { processedImages, loadProcessedImages, postToInstagram, deleteProcessedImage, isLoading } = useAppStore()
  const [deletingImages, setDeletingImages] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadProcessedImages()
  }, [loadProcessedImages])

  const handlePost = async (filename: string) => {
    await postToInstagram(filename)
  }

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return
    }
    
    setDeletingImages(prev => new Set(prev).add(filename))
    const success = await deleteProcessedImage(filename)
    setDeletingImages(prev => {
      const newSet = new Set(prev)
      newSet.delete(filename)
      return newSet
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Image className="w-6 h-6" />
          Image Gallery
        </h2>
        <button
          onClick={loadProcessedImages}
          className="flex items-center gap-2 px-4 py-2 bg-[#EE2D49] hover:bg-[#d41e3a] text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {processedImages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No processed images found</p>
          <p className="text-sm text-gray-500">Upload and process some images first!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedImages.map((image) => (
            <div key={image.filename} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/download/${image.filename}`}
                  alt={image.filename}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${
                  image.posted ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                }`}>
                  {image.posted ? 'Posted' : 'Not Posted'}
                </div>
                
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(image.filename)}
                  disabled={deletingImages.has(image.filename)}
                  className="absolute top-2 left-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Delete image"
                >
                  {deletingImages.has(image.filename) ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-medium text-gray-800 mb-2 truncate">
                  {image.filename}
                </h3>
                <div className="text-sm text-gray-600 space-y-1 mb-3">
                  <p>Size: {(image.size / 1024).toFixed(1)} KB</p>
                  <p>Created: {new Date(image.created).toLocaleDateString()}</p>
                </div>
                
                {!image.posted && (
                  <button
                    onClick={() => handlePost(image.filename)}
                    disabled={isLoading}
                    className="w-full bg-[#EE2D49] hover:bg-[#d41e3a] text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Instagram className="w-4 h-4" />
                        Post to Instagram
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
