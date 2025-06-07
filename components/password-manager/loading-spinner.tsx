'use client'

import { Key } from 'lucide-react'

export default function LoadingSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        
        {/* Main spinner container */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 flex flex-col items-center space-y-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          {/* Icon with rotation */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-75 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl animate-spin">
              <Key className="h-8 w-8 text-white" />
            </div>
          </div>
          
          {/* Loading text */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              SecureVault
            </h2>
            <p className="text-slate-600 font-medium">安全にデータを読み込み中...</p>
          </div>
          
          {/* Progress bar */}
          <div className="w-64 bg-slate-200 rounded-full h-2">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}