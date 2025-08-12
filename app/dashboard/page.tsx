'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientWithInterceptor } from '@/lib/supabase/client-with-interceptor'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Key, Plus, Wifi, WifiOff } from 'lucide-react'
import { encryptData, decryptData, generatePassword } from '@/lib/crypto'
import { toast } from 'sonner'
import { usePWA } from '@/components/pwa/service-worker-provider'
import { isSessionValid, clearSession, setupSessionTimer } from '@/lib/auth-utils'
import { attemptSessionRecovery } from '@/lib/session-recovery'
import Header from '@/components/password-manager/header'
import SearchBar from '@/components/password-manager/search-bar'
import PasswordEntryCard from '@/components/password-manager/password-entry-card'
import AddPasswordForm from '@/components/password-manager/add-password-form'
import EditPasswordForm from '@/components/password-manager/edit-password-form'
import LoadingSpinner from '@/components/password-manager/loading-spinner'

interface PasswordEntry {
  id: string
  service: string
  username: string
  usernameType: 'username' | 'email' | 'id'
  password: string
  category: string
  tags: string[]
  notes: string
  createdAt: string
  updatedAt: string
}

interface EditFormData {
  id: string
  service: string
  username: string
  usernameType: 'username' | 'email' | 'id'
  password: string
  category: string
  tags: string
  notes: string
  entryType: 'both' | 'username-only' | 'password-only'
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<PasswordEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<PasswordEntry[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [loading, setLoading] = useState(true)
  const [isOfflineData, setIsOfflineData] = useState(false)
  const router = useRouter()
  const supabase = createClientWithInterceptor()
  const { isOnline } = usePWA()
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false)

  // 新規エントリ用のフォームデータ
  const [formData, setFormData] = useState({
    service: '',
    username: '',
    usernameType: 'username' as 'username' | 'email' | 'id',
    password: '',
    category: '',
    tags: '',
    notes: '',
    entryType: 'both' as 'both' | 'username-only' | 'password-only',
  })

  // カテゴリとタグの管理
  const [availableCategories, setAvailableCategories] = useState<string[]>(['general', '仕事', 'SNS', 'ショッピング', 'エンターテイメント', 'ユーティリティ'])
  const [availableTags, setAvailableTags] = useState<string[]>(['重要', '個人', '仕事', '緒急時', 'メイン', 'バックアップ'])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedEditTags, setSelectedEditTags] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState('')
  const [newTag, setNewTag] = useState('')

  // タグの色マッピング
  const getTagColor = (tag: string) => {
    const colors = [
      'from-red-50 to-red-100 text-red-700 border-red-200',
      'from-blue-50 to-blue-100 text-blue-700 border-blue-200',
      'from-green-50 to-green-100 text-green-700 border-green-200',
      'from-yellow-50 to-yellow-100 text-yellow-700 border-yellow-200',
      'from-purple-50 to-purple-100 text-purple-700 border-purple-200',
      'from-pink-50 to-pink-100 text-pink-700 border-pink-200',
      'from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200',
      'from-cyan-50 to-cyan-100 text-cyan-700 border-cyan-200',
    ]
    const index = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  // 編集用のフォームデータ
  const [editFormData, setEditFormData] = useState<EditFormData>({
    id: '',
    service: '',
    username: '',
    usernameType: 'username',
    password: '',
    category: '',
    tags: '',
    notes: '',
    entryType: 'both',
  })

  useEffect(() => {
    console.log('[Dashboard] 初期化useEffect実行')
    console.log('[Dashboard] PWA環境チェック:', {
      standalone: window.matchMedia('(display-mode: standalone)').matches,
      userAgent: navigator.userAgent.includes('Mobile')
    })
    
    // PWA環境では Service Worker の準備により時間がかかる可能性があるため調整
    const isPWA = window.matchMedia('(display-mode: standalone)').matches
    const delay = isPWA ? 1000 : 100 // PWAの場合は1秒待機
    
    const initTimer = setTimeout(() => {
      console.log('[Dashboard] Service Worker準備完了 (PWA:', isPWA, ')')
      setIsServiceWorkerReady(true)
    }, delay)

    return () => clearTimeout(initTimer)
  }, [])

  useEffect(() => {
    console.log('[Dashboard] useEffect実行 - isServiceWorkerReady:', isServiceWorkerReady)
    
    if (!isServiceWorkerReady) {
      console.log('[Dashboard] Service Worker準備待ち中...')
      return
    }

    console.log('[Dashboard] 初期化処理開始')
    
    // PWA環境でのセッション管理を改善
    const isPWA = window.matchMedia('(display-mode: standalone)').matches
    console.log('[Dashboard] PWA環境:', isPWA)
    
    try {
      // セッションの有効性をチェック（ブラウザ再起動後の復元確認）
      if (!isSessionValid()) {
        console.log('[Dashboard] セッション無効 - 復元を試行')
        
        // PWA環境ではセッション復元をより慎重に行う
        if (isPWA) {
          // PWAでは直接 localStorage を確認
          const hasBackupKey = localStorage.getItem('backup-encryption-key')
          const hasBackupSalt = localStorage.getItem('backup-user-salt')
          console.log('[Dashboard] PWA バックアップチェック:', { hasBackupKey: !!hasBackupKey, hasBackupSalt: !!hasBackupSalt })
          
          if (!hasBackupKey || !hasBackupSalt) {
            console.log('[Dashboard] PWA環境でバックアップなし - 認証画面へ')
            toast.warning('PWA環境でセッション情報が見つかりません。再度ログインしてください。')
            setLoading(false) // 強制的にローディング停止
            setTimeout(() => {
              router.push('/auth?session_expired=true')
            }, 100) // 少し遅延させてローディング停止を確実にする
            return
          }
        }
        
        const recovered = attemptSessionRecovery()
        if (!recovered) {
          console.log('[Dashboard] セッション復元失敗 - 認証画面へ')
          toast.error('セッションが期限切れです。再度ログインしてください。')
          setLoading(false)
          setTimeout(() => {
            router.push('/auth?session_expired=true')
          }, 100)
          return
        }
        console.log('[Dashboard] セッション復元成功')
      }
    } catch (sessionError) {
      console.error('[Dashboard] セッションチェックエラー:', sessionError)
      toast.error('セッション確認中にエラーが発生しました。再度ログインしてください。')
      setLoading(false)
      setTimeout(() => {
        router.push('/auth?session_expired=true')
      }, 100)
      return
    }
    
    // セッションタイマーを設定（自動ログアウト）
    const timer = setupSessionTimer(() => {
      toast.error('セッションが期限切れになりました。')
      clearSession()
      
      // PWA環境の場合はService Workerに通知
      if (isPWA && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SESSION_EXPIRED'
        })
      }
      
      router.push('/auth?session_expired=true')
    })
    
    console.log('[Dashboard] データ読み込み開始')
    loadEntries()
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isServiceWorkerReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // オンライン状態の変化を監視
  useEffect(() => {
    if (isOnline && isOfflineData) {
      // オフラインからオンラインに復帰した場合、データを再読み込み
      console.log('[Dashboard] オンライン復帰 - データ再読み込み')
      loadEntries()
      toast.success('オンラインに復帰しました。データを同期しています')
    }
  }, [isOnline, isOfflineData]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // 検索フィルタリング
    let filtered = entries.filter(entry =>
      entry.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // カテゴリフィルタリング
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(entry => entry.category === categoryFilter)
    }

    setFilteredEntries(filtered)
  }, [searchQuery, categoryFilter, entries])

  const loadEntries = async () => {
    console.log('[Dashboard] loadEntries開始')
    const isPWA = window.matchMedia('(display-mode: standalone)').matches
    console.log('[Dashboard] PWA環境でloadEntries:', isPWA)
    
    try {
      // PWA環境では追加の遅延を設ける
      if (isPWA) {
        console.log('[Dashboard] PWA環境 - 追加待機')
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // 暗号化キーの確認・復元
      let encryptionKey = sessionStorage.getItem('encryptionKey')
      console.log('[Dashboard] 暗号化キーチェック:', !!encryptionKey)
      
      // SessionStorageにない場合、バックアップから復元を試行
      if (!encryptionKey) {
        console.log('[Dashboard] セッション復元を試行')
        
        // PWA環境では直接バックアップから復元
        if (isPWA) {
          const backupKey = localStorage.getItem('backup-encryption-key')
          if (backupKey) {
            sessionStorage.setItem('encryptionKey', backupKey)
            encryptionKey = backupKey
            console.log('[Dashboard] PWA環境で直接復元成功')
            toast.success('PWA環境でセッションを復元しました')
          } else {
            console.log('[Dashboard] PWA環境でバックアップなし')
            toast.warning('PWA環境でセッション情報が見つかりません。再度ログインしてください。')
            setLoading(false)
            setTimeout(() => {
              router.push('/auth')
            }, 100)
            return
          }
        } else {
          if (attemptSessionRecovery()) {
            encryptionKey = sessionStorage.getItem('encryptionKey')
            console.log('[Dashboard] セッション復元成功:', !!encryptionKey)
            toast.success('セッションを復元しました')
          } else {
            console.log('[Dashboard] セッション復元失敗')
            toast.warning('セッションの復元に失敗しました。再度ログインしてください。')
            setLoading(false)
            setTimeout(() => {
              router.push('/auth')
            }, 100)
            return
          }
        }
      }

      // オンライン状態の確認（PWA環境では navigator.onLine も確認）
      const actuallyOnline = isPWA ? (navigator.onLine && isOnline) : isOnline
      console.log('[Dashboard] オンライン状態:', { isOnline, navigatorOnline: navigator.onLine, actuallyOnline })
      
      // オンライン時の処理
      if (actuallyOnline) {
        console.log('[Dashboard] オンライン処理開始')
        
        // PWA環境でのSupabase認証を慎重に行う
        let user = null
        try {
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
          if (authError) {
            console.error('[Dashboard] 認証エラー:', authError)
            throw authError
          }
          user = authUser
        } catch (authErr) {
          console.error('[Dashboard] Supabase認証失敗:', authErr)
          if (isPWA) {
            // PWA環境では認証エラーの場合でも暗号化キーがあれば継続を試みる
            console.log('[Dashboard] PWA環境で認証失敗 - 暗号化キーチェック')
            if (encryptionKey) {
              console.log('[Dashboard] PWA環境で暗号化キーあり - オフライン処理へ')
              // オフライン処理にフォールバック
              setEntries([])
              setIsOfflineData(true)
              toast.warning('PWA環境でサーバー接続に問題があります。オフライン機能で動作します')
              return
            }
          }
          setLoading(false)
          router.push('/auth')
          return
        }
        
        if (!user) {
          console.log('[Dashboard] ユーザー認証失敗')
          setLoading(false)
          router.push('/auth')
          return
        }

        console.log('[Dashboard] データベースクエリ実行')
        const { data, error } = await supabase
          .from('password_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (error) {
          console.error('[Dashboard] データベースエラー:', error)
          throw error
        }

        console.log('[Dashboard] 取得データ数:', data?.length || 0)

        // データが空の場合（新規ユーザー）の処理
        if (!data || data.length === 0) {
          console.log('[Dashboard] 新規ユーザー処理')
          setEntries([])
          setIsOfflineData(false)
          return
        }

        // 復号化処理
        console.log('[Dashboard] 復号化処理開始')
        const decryptedEntries: PasswordEntry[] = []
        
        for (const entry of data) {
          try {
            if (!encryptionKey) {
              throw new Error('暗号化キーが見つかりません')
            }
            const decryptedData = JSON.parse(decryptData(entry.encrypted_data, encryptionKey))
            decryptedEntries.push({
              id: entry.id,
              ...decryptedData,
              createdAt: entry.created_at,
              updatedAt: entry.updated_at,
            })
          } catch (e) {
            console.error('[Dashboard] 復号化エラー:', e)
            toast.error('データの復号化に失敗しました。再度ログインしてください。')
            setLoading(false)
            router.push('/auth')
            return
          }
        }

        console.log('[Dashboard] 復号化完了 - エントリ数:', decryptedEntries.length)
        setEntries(decryptedEntries)
        setIsOfflineData(false)
        
      } else {
        console.log('[Dashboard] オフライン処理')
        // オフライン時は空配列を設定（簡素化）
        setEntries([])
        setIsOfflineData(true)
        toast.info('オフラインモードです')
      }
      
    } catch (error) {
      console.error('[Dashboard] loadEntries エラー:', error)
      toast.error('データの読み込みに失敗しました')
      setEntries([])
    } finally {
      console.log('[Dashboard] loadEntries完了 - ローディング停止')
      setLoading(false)
    }
  }

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // オフライン時のチェック
    if (!isOnline) {
      toast.error('オフライン時は新規追加できません。オンラインに復帰してからお試しください')
      return
    }
    
    try {
      const encryptionKey = sessionStorage.getItem('encryptionKey')
      if (!encryptionKey) throw new Error('暗号化キーが見つかりません')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが見つかりません')

      // データを暗号化
      const entryData = {
        service: formData.service,
        username: formData.entryType === 'password-only' ? '' : formData.username,
        usernameType: formData.usernameType,
        password: formData.entryType === 'username-only' ? '' : formData.password,
        category: formData.category,
        tags: selectedTags,
        notes: formData.notes,
        entryType: formData.entryType,
      }

      const encryptedData = encryptData(JSON.stringify(entryData), encryptionKey)

      const { error } = await supabase
        .from('password_entries')
        .insert({
          user_id: user.id,
          encrypted_data: encryptedData,
        })

      if (error) throw error

      toast.success('パスワードを保存しました')
      setShowAddForm(false)
      setFormData({
        service: '',
        username: '',
        usernameType: 'username',
        password: '',
        category: '',
        tags: '',
        notes: '',
        entryType: 'both',
      })
      setSelectedTags([])
      loadEntries()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
    }
  }

  const handleDeleteEntry = async (id: string) => {
    // オフライン時のチェック
    if (!isOnline) {
      toast.error('オフライン時は削除できません。オンラインに復帰してからお試しください')
      return
    }
    
    if (!confirm('このエントリを削除してもよろしいですか？')) return

    try {
      const { error } = await supabase
        .from('password_entries')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast.success('エントリを削除しました')
      loadEntries()
    } catch {
      toast.error('削除に失敗しました')
    }
  }

  const copyToClipboard = (text: string, type?: string) => {
    navigator.clipboard.writeText(text)
    const message = type ? `${type}をクリップボードにコピーしました` : 'クリップボードにコピーしました'
    toast.success(message)
  }

  const copyBothToClipboard = (username: string, password: string) => {
    const bothText = `${username}\n${password}`
    navigator.clipboard.writeText(bothText)
    toast.success('ユーザー識別情報とパスワードをクリップボードにコピーしました')
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      clearSession() // セッション情報をクリア
      sessionStorage.removeItem('encryptionKey')
      
      // バックアップデータもクリア
      localStorage.removeItem('backup-encryption-key')
      localStorage.removeItem('backup-user-salt')
      
      router.push('/auth')
    } catch (error) {
      console.error('Logout error:', error)
      // エラーが発生してもセッションをクリアして認証ページに移動
      clearSession()
      sessionStorage.removeItem('encryptionKey')
      localStorage.removeItem('backup-encryption-key')
      localStorage.removeItem('backup-user-salt')
      router.push('/auth')
    }
  }

  const generateNewPassword = () => {
    const newPassword = generatePassword(16, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    })
    setFormData({ ...formData, password: newPassword })
  }

  const generateNewPasswordForEdit = () => {
    const newPassword = generatePassword(16, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    })
    setEditFormData({ ...editFormData, password: newPassword })
  }

  const handleEditEntry = (entry: PasswordEntry) => {
    // エントリタイプを推定
    const entryType = (!entry.username && entry.password) ? 'password-only' :
                     (entry.username && !entry.password) ? 'username-only' : 'both'
    
    setEditFormData({
      id: entry.id,
      service: entry.service,
      username: entry.username,
      usernameType: entry.usernameType || 'username',
      password: entry.password,
      category: entry.category,
      tags: entry.tags.join(', '),
      notes: entry.notes,
      entryType: entryType,
    })
    setSelectedEditTags(entry.tags)
    setShowEditForm(true)
  }

  const handleUpdateEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // オフライン時のチェック
    if (!isOnline) {
      toast.error('オフライン時は編集できません。オンラインに復帰してからお試しください')
      return
    }
    
    try {
      const encryptionKey = sessionStorage.getItem('encryptionKey')
      if (!encryptionKey) throw new Error('暗号化キーが見つかりません')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('ユーザーが見つかりません')

      // データを暗号化
      const entryData = {
        service: editFormData.service,
        username: editFormData.entryType === 'password-only' ? '' : editFormData.username,
        usernameType: editFormData.usernameType,
        password: editFormData.entryType === 'username-only' ? '' : editFormData.password,
        category: editFormData.category,
        tags: selectedEditTags,
        notes: editFormData.notes,
        entryType: editFormData.entryType,
      }

      const encryptedData = encryptData(JSON.stringify(entryData), encryptionKey)

      const { error } = await supabase
        .from('password_entries')
        .update({
          encrypted_data: encryptedData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editFormData.id)

      if (error) throw error

      toast.success('パスワードを更新しました')
      setShowEditForm(false)
      setEditFormData({
        id: '',
        service: '',
        username: '',
        usernameType: 'username',
        password: '',
        category: '',
        tags: '',
        notes: '',
        entryType: 'both',
      })
      setSelectedEditTags([])
      loadEntries()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'エラーが発生しました')
    }
  }

  // タグ管理ヘルパー関数
  const handleTagSelect = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleTagRemove = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const handleEditTagSelect = (tag: string) => {
    if (!selectedEditTags.includes(tag)) {
      setSelectedEditTags([...selectedEditTags, tag])
    }
  }

  const handleEditTagRemove = (tag: string) => {
    setSelectedEditTags(selectedEditTags.filter(t => t !== tag))
  }

  const handleAddCategory = () => {
    if (newCategory && !availableCategories.includes(newCategory)) {
      setAvailableCategories([...availableCategories, newCategory])
      setFormData({ ...formData, category: newCategory })
      setNewCategory('')
    }
  }

  const handleAddEditCategory = () => {
    if (newCategory && !availableCategories.includes(newCategory)) {
      setAvailableCategories([...availableCategories, newCategory])
      setEditFormData({ ...editFormData, category: newCategory })
      setNewCategory('')
    }
  }

  const handleAddTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag])
      if (!selectedTags.includes(newTag)) {
        setSelectedTags([...selectedTags, newTag])
      }
      setNewTag('')
    }
  }

  const handleAddEditTag = () => {
    if (newTag && !availableTags.includes(newTag)) {
      setAvailableTags([...availableTags, newTag])
      if (!selectedEditTags.includes(newTag)) {
        setSelectedEditTags([...selectedEditTags, newTag])
      }
      setNewTag('')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="absolute inset-0 opacity-40">
        <div className="w-full h-full bg-gradient-to-br from-indigo-100/20 to-cyan-100/20"></div>
      </div>
      
      <Header onLogout={handleLogout} />

      <main className="relative container mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <SearchBar 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddNew={() => {
            if (!isOnline) {
              toast.error('オフライン時は新規追加できません')
              return
            }
            setShowAddForm(true)
          }}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          availableCategories={availableCategories}
        />

        {showAddForm && (
          <AddPasswordForm
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleAddEntry}
            onCancel={() => setShowAddForm(false)}
            onGeneratePassword={generateNewPassword}
            availableCategories={availableCategories}
            availableTags={availableTags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            onTagRemove={handleTagRemove}
            newCategory={newCategory}
            onNewCategoryChange={setNewCategory}
            onAddCategory={handleAddCategory}
            newTag={newTag}
            onNewTagChange={setNewTag}
            onAddTag={handleAddTag}
            getTagColor={getTagColor}
          />
        )}

        {showEditForm && (
          <EditPasswordForm
            editFormData={editFormData}
            onFormDataChange={setEditFormData}
            onSubmit={handleUpdateEntry}
            onCancel={() => setShowEditForm(false)}
            onGeneratePassword={generateNewPasswordForEdit}
            availableCategories={availableCategories}
            availableTags={availableTags}
            selectedTags={selectedEditTags}
            onTagSelect={handleEditTagSelect}
            onTagRemove={handleEditTagRemove}
            newCategory={newCategory}
            onNewCategoryChange={setNewCategory}
            onAddCategory={handleAddEditCategory}
            newTag={newTag}
            onNewTagChange={setNewTag}
            onAddTag={handleAddEditTag}
            getTagColor={getTagColor}
          />
        )}

        <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredEntries.map((entry) => (
            <PasswordEntryCard
              key={entry.id}
              entry={entry}
              showPassword={showPasswords[entry.id] || false}
              onTogglePassword={() =>
                setShowPasswords({ ...showPasswords, [entry.id]: !showPasswords[entry.id] })
              }
              onCopyUsername={() => copyToClipboard(entry.username, 'ユーザー識別情報')}
              onCopyPassword={() => copyToClipboard(entry.password, 'パスワード')}
              onCopyBoth={() => copyBothToClipboard(entry.username, entry.password)}
              onEdit={() => {
                if (!isOnline) {
                  toast.error('オフライン時は編集できません')
                  return
                }
                handleEditEntry(entry)
              }}
              onDelete={() => {
                if (!isOnline) {
                  toast.error('オフライン時は削除できません')
                  return
                }
                handleDeleteEntry(entry.id)
              }}
              getTagColor={getTagColor}
            />
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="relative mt-8 sm:mt-16 col-span-full">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-indigo-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
            <Card className="relative bg-white/70 backdrop-blur-xl shadow-xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
              <CardContent className="text-center py-12 sm:py-20 px-4 sm:px-8">
                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-400 to-indigo-400 rounded-full blur opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-slate-500 to-indigo-500 p-3 sm:p-4 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                    <Key className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                </div>
                
                <h3 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-slate-700 to-indigo-700 bg-clip-text text-transparent mb-3 sm:mb-4">
                  {searchQuery ? '検索結果がありません' : 'パスワードがまだ登録されていません'}
                </h3>
                
                {!searchQuery && (
                  <>
                    <p className="text-sm sm:text-lg text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-2">
                      最初のパスワードを追加して、安全で美しいパスワード管理を始めましょう
                    </p>
                    <Button 
                      onClick={() => setShowAddForm(true)} 
                      className="h-12 sm:h-14 px-6 sm:px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-base sm:text-lg rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105"
                    >
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      パスワードを追加
                    </Button>
                  </>
                )}
                
                {searchQuery && (
                  <p className="text-sm sm:text-base text-slate-600 mb-6 px-2">
                    「{searchQuery}」に一致するアイテムが見つかりませんでした
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <div className={`bg-white/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-3 sm:p-4 transition-all duration-300 hover:shadow-xl ${!isOnline ? 'border-amber-200 bg-amber-50/90' : ''}`}>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-3 h-3 text-green-600" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber-600" />
            )}
            <div>
              <p className="text-xs text-slate-600 font-semibold">
                {entries.length}件のパスワードを安全に管理中
              </p>
              {isOfflineData && (
                <p className="text-xs text-amber-600 mt-1">
                  オフラインデータを表示中
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}