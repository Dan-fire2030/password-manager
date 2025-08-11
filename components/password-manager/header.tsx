'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { LogOut, Key, Fingerprint, Clock } from 'lucide-react'
import { BiometricSetup } from '@/components/biometric/biometric-setup'
import { isBiometricAvailable, isBiometricRegistered } from '@/lib/webauthn'
import { createClient } from '@/lib/supabase/client'
import { getSessionRemainingTimeString } from '@/lib/auth-utils'

interface HeaderProps {
  onLogout: () => void
}

export default function Header({ onLogout }: HeaderProps) {
  const [showBiometricSetup, setShowBiometricSetup] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [biometricRegistered, setBiometricRegistered] = useState(false)
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const supabase = createClient()

  useEffect(() => {
    checkBiometricStatus()
    getUserInfo()
    
    // セッション残り時間を定期的に更新
    const updateSessionTime = () => {
      setSessionTime(getSessionRemainingTimeString())
    }
    
    updateSessionTime()
    const interval = setInterval(updateSessionTime, 1000) // 1秒ごとに更新
    
    return () => clearInterval(interval)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkBiometricStatus = async () => {
    const available = await isBiometricAvailable()
    setBiometricAvailable(available)
  }

  const getUserInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
      setUserEmail(user.email || '')
      const registered = isBiometricRegistered(user.id)
      setBiometricRegistered(registered)
    }
  }
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
          <div className="flex items-center gap-2">
            {/* セッション残り時間表示 */}
            {sessionTime && sessionTime !== 'セッション終了' && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">
                <Clock className="h-3 w-3" />
                <span>{sessionTime}</span>
              </div>
            )}
            
            {/* 生体認証設定ボタン */}
            {biometricAvailable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowBiometricSetup(true)}
                className="relative group hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 rounded-lg sm:rounded-xl h-8 w-8 sm:h-10 sm:w-10"
              >
                <Fingerprint className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110 ${biometricRegistered ? 'text-green-600' : ''}`} />
                <div className="absolute -inset-1 bg-indigo-100 rounded-lg sm:rounded-xl opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                {biometricRegistered && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </Button>
            )}
            
            {/* ログアウトボタン */}
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
      </div>
      
      {/* 生体認証設定モーダル */}
      {showBiometricSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <BiometricSetup
            userId={userId}
            username={userEmail}
            onClose={() => {
              setShowBiometricSetup(false)
              getUserInfo() // 状態を更新
            }}
          />
        </div>
      )}
    </header>
  )
}