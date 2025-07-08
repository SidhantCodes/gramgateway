import { create } from 'zustand'
import { apiClient } from '@/lib/api'
import toast from 'react-hot-toast'

export type TabType = 'upload' | 'login' | 'gallery' | 'settings'

export interface ServerStatus {
  online: boolean
  message: string
  timestamp?: string
}

export interface InstagramStatus {
  loggedIn: boolean
  username?: string
  fullName?: string
  followerCount?: number
  followingCount?: number
  mediaCount?: number
  message?: string
}

export interface ProcessedImage {
  filename: string
  size: number
  created: string
  modified: string
  posted: boolean
  caption?: string
}

export interface AppState {
  // UI State
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  
  // Server Status
  serverStatus: ServerStatus
  checkServerStatus: () => Promise<void>
  
  // Instagram Status
  instagramStatus: InstagramStatus
  checkInstagramStatus: () => Promise<void>
  loginToInstagram: (username: string, password: string) => Promise<boolean>
  
  // Image Processing
  processedImages: ProcessedImage[]
  loadProcessedImages: () => Promise<void>
  uploadAndProcessImage: (file: File, caption?: string, watermark?: string) => Promise<boolean>
  postToInstagram: (filename: string, customCaption?: string) => Promise<boolean>
  
  // Settings
  apiBaseUrl: string
  setApiBaseUrl: (url: string) => void
  
  // Loading States
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  activeTab: 'upload',
  serverStatus: { online: false, message: 'Checking...' },
  instagramStatus: { loggedIn: false },
  processedImages: [],
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001',
  isLoading: false,

  // UI Actions
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
  setIsLoading: (loading: boolean) => set({ isLoading: loading }),
  setApiBaseUrl: (url: string) => {
    set({ apiBaseUrl: url })
    if (typeof window !== 'undefined') {
      localStorage.setItem('apiBaseUrl', url)
    }
  },

  // Server Status
  checkServerStatus: async () => {
    try {
      const response = await apiClient.get('/health')
      if (response.data.status === 'healthy') {
        set({
          serverStatus: {
            online: true,
            message: 'Connected',
            timestamp: response.data.timestamp
          }
        })
      } else {
        set({
          serverStatus: {
            online: false,
            message: 'Server Unhealthy'
          }
        })
      }
    } catch (error) {
      set({
        serverStatus: {
          online: false,
          message: 'Connection Failed'
        }
      })
    }
  },

  // Instagram Status
  checkInstagramStatus: async () => {
    try {
      const response = await apiClient.get('/instagram/status')
      const data = response.data
      
      if (data.logged_in) {
        set({
          instagramStatus: {
            loggedIn: true,
            username: data.account?.username,
            fullName: data.account?.full_name,
            followerCount: data.account?.follower_count,
            followingCount: data.account?.following_count,
            mediaCount: data.account?.media_count,
            message: data.message
          }
        })
      } else {
        set({
          instagramStatus: {
            loggedIn: false,
            message: data.message
          }
        })
      }
    } catch (error) {
      set({
        instagramStatus: {
          loggedIn: false,
          message: 'Status check failed'
        }
      })
    }
  },

  loginToInstagram: async (username: string, password: string) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.post('/instagram/login', {
        username,
        password
      })
      
      if (response.data.success) {
        toast.success('Successfully logged in to Instagram!')
        await get().checkInstagramStatus()
        set({ isLoading: false })
        return true
      } else {
        toast.error(response.data.error || 'Login failed')
        set({ isLoading: false })
        return false
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Login failed'
      toast.error(message)
      set({ isLoading: false })
      return false
    }
  },

  // Image Processing
  loadProcessedImages: async () => {
    try {
      const response = await apiClient.get('/images/processed')
      const data = response.data
      
      if (data.processed_images) {
        set({ processedImages: data.processed_images })
      }
    } catch (error) {
      toast.error('Failed to load processed images')
    }
  },

  uploadAndProcessImage: async (file: File, caption?: string, watermark?: string) => {
    set({ isLoading: true })
    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      
      const uploadResponse = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (!uploadResponse.data.filename) {
        throw new Error('Upload failed')
      }
      
      // Process image
      const processData = {
        filename: uploadResponse.data.filename,
        custom_caption: caption,
        watermark_text: watermark || '©PnC'
      }
      
      const processResponse = await apiClient.post('/process', processData)
      
      if (processResponse.data.success) {
        toast.success('Image processed successfully!')
        await get().loadProcessedImages()
        set({ isLoading: false })
        return true
      } else {
        throw new Error(processResponse.data.error || 'Processing failed')
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Upload failed'
      toast.error(message)
      set({ isLoading: false })
      return false
    }
  },

  postToInstagram: async (filename: string, customCaption?: string) => {
    set({ isLoading: true })
    try {
      const response = await apiClient.post('/instagram/post', {
        filename,
        custom_caption: customCaption
      })
      
      if (response.data.success) {
        toast.success('Posted to Instagram successfully!')
        await get().loadProcessedImages()
        set({ isLoading: false })
        return true
      } else {
        throw new Error(response.data.error || 'Posting failed')
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'Posting failed'
      toast.error(message)
      set({ isLoading: false })
      return false
    }
  }
}))

// Initialize settings from localStorage
if (typeof window !== 'undefined') {
  const savedApiUrl = localStorage.getItem('apiBaseUrl')
  if (savedApiUrl) {
    useAppStore.getState().setApiBaseUrl(savedApiUrl)
  }
}
