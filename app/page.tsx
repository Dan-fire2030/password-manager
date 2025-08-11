import { redirect } from 'next/navigation'

export default async function Home() {
  // ミドルウェアが認証チェックを行うので、ここでは単純にダッシュボードにリダイレクト
  // ログインしていない場合はミドルウェアが/authにリダイレクト
  redirect('/dashboard')
}