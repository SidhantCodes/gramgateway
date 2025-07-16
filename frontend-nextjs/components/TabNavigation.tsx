'use client'

import { useAppStore } from '@/store/appStore'
import { Upload, Image, Settings } from 'lucide-react'

const tabs = [
  { id: 'upload', label: 'Upload & Process', icon: Upload },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const

export default function TabNavigation() {
  const { activeTab, setActiveTab } = useAppStore()

  return (
    <div className="flex flex-wrap gap-2 bg-[#FFF0DD] p-2 rounded-xl border border-gray-200">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 transform ${
            activeTab === id
              ? 'bg-[#EE2D49] text-white shadow-lg hover:shadow-xl scale-105 border-2 border-[#c41e3a]'
              : 'text-gray-700 bg-white hover:bg-gray-50 hover:shadow-md hover:scale-105 border border-gray-200'
          }`}
        >
          <Icon className="w-4 h-4" />
          <span className="hidden sm:block">{label}</span>
        </button>
      ))}
    </div>
  )
}
