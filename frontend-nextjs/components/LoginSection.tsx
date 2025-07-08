'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { LogIn, User, Lock } from 'lucide-react'

export default function LoginSection() {
  const { loginToInstagram, instagramStatus, isLoading } = useAppStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) return
    
    const success = await loginToInstagram(username, password)
    if (success) {
      setPassword('') // Clear password for security
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <LogIn className="w-6 h-6" />
        Instagram Account Management
      </h2>

      {instagramStatus.loggedIn ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Connected Successfully!
          </h3>
          <div className="space-y-1 text-green-700">
            <p>Username: @{instagramStatus.username}</p>
            {instagramStatus.fullName && (
              <p>Name: {instagramStatus.fullName}</p>
            )}
            {instagramStatus.followerCount && (
              <p>Followers: {instagramStatus.followerCount.toLocaleString()}</p>
            )}
            {instagramStatus.mediaCount && (
              <p>Posts: {instagramStatus.mediaCount.toLocaleString()}</p>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-instagram-blue focus:border-transparent"
              placeholder="Your Instagram username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-instagram-blue focus:border-transparent"
              placeholder="Your Instagram password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!username || !password || isLoading}
            className="w-full bg-instagram-gradient text-white py-3 px-6 rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="spinner w-5 h-5" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login to Instagram
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
