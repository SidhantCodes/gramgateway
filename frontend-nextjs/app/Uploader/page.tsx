'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import StatusBar from '@/components/StatusBar'
import TabNavigation from '@/components/TabNavigation'
import UploadSection from '@/components/UploadSection'
import GallerySection from '@/components/GallerySection'
import SettingsSection from '@/components/SettingsSection'
import { useAppStore } from '@/store/appStore'
import { LogIn } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const { activeTab, serverStatus, checkServerStatus, instagramStatus, checkInstagramStatus } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check server status and Instagram status on component mount
    const initializeApp = async () => {
      await checkServerStatus()
      await checkInstagramStatus()
      setIsLoading(false)
    }
    
    initializeApp()
    
    // Set up interval to check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000)
    
    return () => clearInterval(interval)
  }, [checkServerStatus, checkInstagramStatus])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !instagramStatus.loggedIn) {
      router.push('/login')
    }
  }, [isLoading, instagramStatus.loggedIn, router])

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadSection />
      case 'gallery':
        return <GallerySection />
      case 'settings':
        return <SettingsSection />
      default:
        return <UploadSection />
    }
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF0DD] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#EE2D49] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show access denied message if not logged in
  if (!instagramStatus.loggedIn) {
    return (
      <div className="min-h-screen bg-[#FFF0DD] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You need to log in to your Instagram account to access the uploader.
          </p>
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 bg-[#EE2D49] hover:bg-[#d41e3a] text-white font-semibold py-3 px-6 rounded-lg border-2 border-[#c41e3a] transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <LogIn className="w-5 h-5" />
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF0DD] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-100">
          <Header />
          <div className="p-6 md:p-8">
            <StatusBar />
            <TabNavigation />
            <div className="mt-8">
              {renderActiveTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
