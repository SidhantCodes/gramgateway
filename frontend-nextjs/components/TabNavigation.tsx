'use client'

import { useAppStore } from '@/store/appStore'
import { Upload, Image, LogIn, Settings } from 'lucide-react'

const tabs = [
  { id: 'upload', label: 'Upload & Process', icon: Upload },
  { id: 'login', label: 'Instagram Login', icon: LogIn },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-xl">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            activeTab === id
              ? 'bg-instagram-blue text-white shadow-lg transform -translate-y-1'
              : 'text-gray-600 hover:bg-white hover:shadow-md'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:block">{label}</span>
        </button>
      ))}
    </div>
  )
}
