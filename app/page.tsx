import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  
  // ユーザーのセッションを確認
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // ログイン済みの場合はダッシュボードへ
    redirect('/dashboard')
  } else {
    // 未ログインの場合は認証画面へ
    redirect('/auth')
  }
}