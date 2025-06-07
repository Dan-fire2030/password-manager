'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const logout = async () => {
      try {
        await supabase.auth.signOut()
        sessionStorage.removeItem('encryptionKey')
        router.push('/auth')
      } catch (error) {
        console.error('Logout error:', error)
        // エラーが発生してもセッションをクリアして認証ページに移動
        sessionStorage.removeItem('encryptionKey')
        router.push('/auth')
      }
    }
    logout()
  }, [router, supabase])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>ログアウト中...</p>
    </div>
  )
}