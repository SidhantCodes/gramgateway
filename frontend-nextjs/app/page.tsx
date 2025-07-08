'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import StatusBar from '@/components/StatusBar'
import TabNavigation from '@/components/TabNavigation'
import UploadSection from '@/components/UploadSection'
import LoginSection from '@/components/LoginSection'
import GallerySection from '@/components/GallerySection'
import SettingsSection from '@/components/SettingsSection'
import { useAppStore } from '@/store/appStore'

export default function Home() {
  const { activeTab, serverStatus, checkServerStatus } = useAppStore()

  useEffect(() => {
    // Check server status on component mount
    checkServerStatus()
    
    // Set up interval to check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000)
    
    return () => clearInterval(interval)
  }, [checkServerStatus])

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'upload':
        return <UploadSection />
      case 'login':
        return <LoginSection />
      case 'gallery':
        return <GallerySection />
      case 'settings':
        return <SettingsSection />
      default:
        return <UploadSection />
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
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
