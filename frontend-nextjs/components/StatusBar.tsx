'use client'

import { useAppStore } from '@/store/appStore'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'

export default function StatusBar() {
  const { serverStatus, instagramStatus, checkServerStatus, checkInstagramStatus } = useAppStore()

  const handleRefresh = async () => {
    await Promise.all([
      checkServerStatus(),
      checkInstagramStatus()
    ])
  }

  return (
    <div className={`rounded-xl p-6 mb-6 border-2 ${
      serverStatus.online && instagramStatus.loggedIn 
        ? 'bg-green-50 border-green-400' 
        : 'bg-red-50 border-red-400'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">System Status</h3>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#EE2D49] hover:bg-[#d41e3a] text-white transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Server Status */}
        <div className="flex items-center gap-3">
          {serverStatus.online ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <div>
            <p className="font-medium text-gray-700">Server</p>
            <p className={`text-sm ${serverStatus.online ? 'text-green-600' : 'text-red-600'}`}>
              {serverStatus.message}
            </p>
          </div>
        </div>

        {/* Instagram Status */}
        <div className="flex items-center gap-3">
          {instagramStatus.loggedIn ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <div>
            <p className="font-medium text-gray-700">Instagram</p>
            <p className={`text-sm ${instagramStatus.loggedIn ? 'text-green-600' : 'text-red-600'}`}>
              {instagramStatus.loggedIn 
                ? `Connected as @${instagramStatus.username}` 
                : 'Not connected'
              }
            </p>
            {instagramStatus.loggedIn && instagramStatus.followerCount && (
              <p className="text-xs text-gray-500">
                {instagramStatus.followerCount} followers • {instagramStatus.mediaCount} posts
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
