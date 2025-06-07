'use client'

import { Button } from '@/components/ui/button'
import { LogOut, Key } from 'lucide-react'

interface HeaderProps {
  onLogout: () => void
}

export default function Header({ onLogout }: HeaderProps) {
  const handleLogoutClick = async () => {
    try {
      await onLogout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <header className="relative bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-indigo-500/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                <Key className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SecureVault
              </h1>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">パスワードマネージャー</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogoutClick} 
            className="relative group hover:bg-red-50 hover:text-red-600 transition-all duration-300 rounded-lg sm:rounded-xl h-8 w-8 sm:h-10 sm:w-10"
          >
            <LogOut className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
            <div className="absolute -inset-1 bg-red-100 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
          </Button>
        </div>
      </div>
    </header>
  )
}