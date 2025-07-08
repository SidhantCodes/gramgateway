'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { Settings, Server, Wifi, Save } from 'lucide-react'

export default function SettingsSection() {
  const { apiBaseUrl, setApiBaseUrl, checkServerStatus } = useAppStore()
  const [tempUrl, setTempUrl] = useState(apiBaseUrl)

  const handleSave = () => {
    setApiBaseUrl(tempUrl)
  }

  const handleTest = async () => {
    await checkServerStatus()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <Settings className="w-6 h-6" />
        Settings
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            <Server className="w-4 h-4 inline mr-2" />
            Server URL
          </label>
          <input
            type="url"
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-instagram-blue focus:border-transparent"
            placeholder="http://localhost:8000"
          />
          <p className="text-sm text-gray-500">
            Change this if your server is running on a different port or domain
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-instagram-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          
          <button
            onClick={handleTest}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Wifi className="w-4 h-4" />
            Test Connection
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">About GramGateway</h3>
        <div className="space-y-2 text-gray-600">
          <p>Version: 2.0.0</p>
          <p>Built with Next.js, React, and Tailwind CSS</p>
          <p>AI-powered Instagram image processing and posting</p>
          <p>Integrated with GitHub Copilot MCP</p>
        </div>
      </div>
    </div>
  )
}
