'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Key, RefreshCw } from 'lucide-react'
import PasswordStrengthIndicator from './password-strength-indicator'

interface FormData {
  service: string
  username: string
  usernameType: 'username' | 'email' | 'id'
  password: string
  category: string
  tags: string
  notes: string
  entryType: 'both' | 'username-only' | 'password-only'
}

interface AddPasswordFormProps {
  formData: FormData
  onFormDataChange: (data: FormData) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onGeneratePassword: () => void
  availableCategories: string[]
  availableTags: string[]
  selectedTags: string[]
  onTagSelect: (tag: string) => void
  onTagRemove: (tag: string) => void
  newCategory: string
  onNewCategoryChange: (value: string) => void
  onAddCategory: () => void
  newTag: string
  onNewTagChange: (value: string) => void
  onAddTag: () => void
  getTagColor: (tag: string) => string
}

export default function AddPasswordForm({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  onGeneratePassword,
  availableCategories,
  availableTags,
  selectedTags,
  onTagSelect,
  onTagRemove,
  newCategory,
  onNewCategoryChange,
  onAddCategory,
  newTag,
  onNewTagChange,
  onAddTag,
  getTagColor
}: AddPasswordFormProps) {
  return (
    <div className="mb-6 sm:mb-8 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl sm:rounded-3xl blur-xl"></div>
      <Card className="relative bg-white/90 backdrop-blur-xl shadow-2xl border-0 rounded-2xl sm:rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-t-2xl sm:rounded-t-3xl border-b border-emerald-100/50 p-4 sm:p-8">
          <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl font-bold text-emerald-800">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                <Key className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            新しいパスワードを追加
          </CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-8">
            <div className="space-y-2">
              <Label htmlFor="service" className="text-sm font-semibold text-slate-700">
                サービス名
              </Label>
              <Input
                id="service"
                value={formData.service}
                onChange={(e) => onFormDataChange({ ...formData, service: e.target.value })}
                required
                placeholder="例: Gmail, Twitter, GitHub"
                className="h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entryType" className="text-sm font-semibold text-slate-700">
                保存する情報の種類
              </Label>
              <Select value={formData.entryType} onValueChange={(value: 'both' | 'username-only' | 'password-only') => onFormDataChange({ ...formData, entryType: value })}>
                <SelectTrigger className="h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300">
                  <SelectValue placeholder="保存する情報を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">ユーザー識別情報とパスワード</SelectItem>
                  <SelectItem value="username-only">ユーザー識別情報のみ</SelectItem>
                  <SelectItem value="password-only">パスワードのみ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.entryType === 'both' || formData.entryType === 'username-only') && (
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-slate-700">
                  ユーザー識別情報
                </Label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={formData.usernameType} onValueChange={(value: 'username' | 'email' | 'id') => onFormDataChange({ ...formData, usernameType: value })}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="username">ユーザー名</SelectItem>
                      <SelectItem value="email">メール</SelectItem>
                      <SelectItem value="id">ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => onFormDataChange({ ...formData, username: e.target.value })}
                    required={formData.entryType === 'both' || formData.entryType === 'username-only'}
                    placeholder={
                      formData.usernameType === 'email' ? '例: user@example.com' :
                      formData.usernameType === 'id' ? '例: user123' :
                      '例: username'
                    }
                    className="w-full sm:flex-1 h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>
            )}
            {(formData.entryType === 'both' || formData.entryType === 'password-only') && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  パスワード
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => onFormDataChange({ ...formData, password: e.target.value })}
                    required={formData.entryType === 'both' || formData.entryType === 'password-only'}
                    placeholder="強力なパスワードを入力"
                    className="h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onGeneratePassword} 
                    className="h-12 px-3 sm:px-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100 text-purple-700 hover:text-purple-800 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <RefreshCw className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">自動生成</span>
                    <span className="sm:hidden text-xs">生成</span>
                  </Button>
                </div>
                <PasswordStrengthIndicator password={formData.password} />
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-slate-700">
                  カテゴリ
                </Label>
                <div className="space-y-2">
                  <Select value={formData.category} onValueChange={(value) => onFormDataChange({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      placeholder="新しいカテゴリを追加"
                      value={newCategory}
                      onChange={(e) => onNewCategoryChange(e.target.value)}
                      className="h-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onAddCategory}
                      className="h-10 px-3"
                    >
                      追加
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-semibold text-slate-700">
                  タグ
                </Label>
                <div className="space-y-2">
                  <Select onValueChange={onTagSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="タグを選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      placeholder="新しいタグを追加"
                      value={newTag}
                      onChange={(e) => onNewTagChange(e.target.value)}
                      className="h-10 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onAddTag}
                      className="h-10 px-3"
                    >
                      追加
                    </Button>
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {selectedTags.map((tag) => (
                        <Badge 
                          key={tag} 
                          className={`bg-gradient-to-r ${getTagColor(tag)} px-3 py-1 rounded-full text-xs font-semibold cursor-pointer`}
                          onClick={() => onTagRemove(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700">
                メモ
              </Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => onFormDataChange({ ...formData, notes: e.target.value })}
                placeholder="このアカウントについての備考"
                className="h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 rounded-xl transition-all duration-300"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Button 
                type="submit" 
                className="h-12 sm:h-14 flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base lg:text-lg rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300"
              >
                保存する
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className="h-12 sm:h-14 px-6 sm:px-8 bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-all duration-300"
              >
                キャンセル
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}