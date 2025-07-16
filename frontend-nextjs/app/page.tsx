'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()

  const handleLoginClick = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-[#FFF0DD] flex flex-col items-center justify-center px-4">
      {/* Logo Container */}
      <div className="flex flex-col items-center space-y-8">
        {/* Logo Placeholder - Replace with your actual logo */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {
          <Image
            src="/logo.png"
            alt="GramGateway Logo"
            width={256}
            height={256}
            className="object-contain"
            priority
          />
          }
        </div>

        {/* App Name */}
        <h1 className="text-5xl font-bold text-[#EE2D49] font-impact">
          Seedhe post
        </h1>

        {/* Login Button */}
        <button
          onClick={handleLoginClick}
          className="bg-[#EE2D49] hover:bg-[#d41e3a] text-white font-impact py-2 px-20 rounded-lg border-2 border-[#c41e3a] transition-all duration-200 ease-in-out transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Login
        </button>
      </div>
    </div>
  )
}
