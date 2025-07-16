'use client'

import { Instagram } from 'lucide-react'

export default function Header() {
  return (
    <div className="bg-[#EE2D49] text-white p-8 text-center border-b-4 border-[#c41e3a]">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Instagram className="w-10 h-10" />
        <h1 className="text-4xl md:text-5xl font-bold font-impact">Seedhe post</h1>
      </div>
      <p className="text-lg md:text-xl opacity-90">
        AI-Powered Instagram Image Processing & Posting Platform
      </p>
    </div>
  )
}
