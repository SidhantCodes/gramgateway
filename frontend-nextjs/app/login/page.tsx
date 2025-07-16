'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/appStore'
import { LogIn, User, Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { loginToInstagram, instagramStatus, isLoading, checkInstagramStatus } = useAppStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Check Instagram status on component mount
  useEffect(() => {
    checkInstagramStatus()
  }, [checkInstagramStatus])

  // Redirect to uploader if already logged in
  useEffect(() => {
    if (instagramStatus.loggedIn) {
      setTimeout(() => {
        router.push('/Uploader')
      }, 2000) // Give user time to see success message
    }
  }, [instagramStatus.loggedIn, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      return
    }
    
    const success = await loginToInstagram(username, password)
    if (success) {
      setPassword('') // Clear password for security
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF0DD] flex flex-col items-center justify-center px-4">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6">
        <Link 
          href="/"
          className="flex items-center gap-2 text-gray-600 hover:text-[#EE2D49] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#EE2D49] font-impact mb-2">
            Login to Instagram
          </h1>
          <p className="text-gray-600">
            Connect your Instagram account to start posting
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-100">
          {instagramStatus.loggedIn ? (
            // Success State
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-green-800">
                Successfully Connected!
              </h3>
              <div className="space-y-2 text-green-700 bg-green-50 rounded-lg p-4">
                <p><strong>Username:</strong> @{instagramStatus.username}</p>
                {instagramStatus.fullName && (
                  <p><strong>Name:</strong> {instagramStatus.fullName}</p>
                )}
                {instagramStatus.followerCount && (
                  <p><strong>Followers:</strong> {instagramStatus.followerCount.toLocaleString()}</p>
                )}
                {instagramStatus.mediaCount && (
                  <p><strong>Posts:</strong> {instagramStatus.mediaCount.toLocaleString()}</p>
                )}
              </div>
              <p className="text-gray-600">
                Redirecting you to the uploader...
              </p>
            </div>
          ) : (
            // Login Form
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <User className="w-4 h-4 inline mr-2" />
                  Instagram Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE2D49] focus:border-transparent transition-all text-black"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EE2D49] focus:border-transparent transition-all text-black"
                  placeholder="Your Instagram password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!username || !password || isLoading}
                className="w-full bg-[#EE2D49] hover:bg-[#d41e3a] text-white font-semibold py-3 px-6 rounded-lg border-2 border-[#c41e3a] transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Login to Instagram
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="text-xs text-gray-500 text-center">
                <p>🔒 Your credentials are securely transmitted and not stored locally</p>
              </div>
            </form>
          )}
        </div>

        {/* Additional Info */}
        {!instagramStatus.loggedIn && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Need help? Make sure you're using your Instagram username 
              (not email) and the correct password.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
