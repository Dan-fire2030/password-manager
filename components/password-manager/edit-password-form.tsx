'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Edit, RefreshCw } from 'lucide-react'
import PasswordStrengthIndicator from './password-strength-indicator'

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

interface EditPasswordFormProps {
  editFormData: EditFormData
  onFormDataChange: (data: EditFormData) => void
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

export default function EditPasswordForm({
  editFormData,
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
}: EditPasswordFormProps) {
  return (
    <div className="mb-8 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl"></div>
      <Card className="relative bg-white/90 backdrop-blur-xl shadow-2xl border-0 rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-t-3xl border-b border-blue-100/50 p-8">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-blue-800">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur opacity-75"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
                <Edit className="h-6 w-6 text-white" />
              </div>
            </div>
            パスワードを編集
          </CardTitle>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2">
              <Label htmlFor="edit-service" className="text-sm font-semibold text-slate-700">
                サービス名
              </Label>
              <Input
                id="edit-service"
                value={editFormData.service}
                onChange={(e) => onFormDataChange({ ...editFormData, service: e.target.value })}
                required
                className="h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-entryType" className="text-sm font-semibold text-slate-700">
                保存する情報の種類
              </Label>
              <Select value={editFormData.entryType} onValueChange={(value: 'both' | 'username-only' | 'password-only') => onFormDataChange({ ...editFormData, entryType: value })}>
                <SelectTrigger className="h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300">
                  <SelectValue placeholder="保存する情報を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">ユーザー識別情報とパスワード</SelectItem>
                  <SelectItem value="username-only">ユーザー識別情報のみ</SelectItem>
                  <SelectItem value="password-only">パスワードのみ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(editFormData.entryType === 'both' || editFormData.entryType === 'username-only') && (
              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-sm font-semibold text-slate-700">
                  ユーザー識別情報
                </Label>
                <div className="flex gap-3">
                  <Select value={editFormData.usernameType} onValueChange={(value: 'username' | 'email' | 'id') => onFormDataChange({ ...editFormData, usernameType: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="username">ユーザー名</SelectItem>
                      <SelectItem value="email">メール</SelectItem>
                      <SelectItem value="id">ID</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="edit-username"
                    value={editFormData.username}
                    onChange={(e) => onFormDataChange({ ...editFormData, username: e.target.value })}
                    required={editFormData.entryType === 'both' || editFormData.entryType === 'username-only'}
                    placeholder={
                      editFormData.usernameType === 'email' ? '例: user@example.com' :
                      editFormData.usernameType === 'id' ? '例: user123' :
                      '例: username'
                    }
                    className="flex-1 h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>
            )}
            {(editFormData.entryType === 'both' || editFormData.entryType === 'password-only') && (
              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-sm font-semibold text-slate-700">
                  パスワード
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="edit-password"
                    type="password"
                    value={editFormData.password}
                    onChange={(e) => onFormDataChange({ ...editFormData, password: e.target.value })}
                    required={editFormData.entryType === 'both' || editFormData.entryType === 'password-only'}
                    className="h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onGeneratePassword} 
                    className="h-12 px-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100 text-purple-700 hover:text-purple-800 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    自動生成
                  </Button>
                </div>
                <PasswordStrengthIndicator password={editFormData.password} />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-sm font-semibold text-slate-700">
                  カテゴリ
                </Label>
                <div className="space-y-2">
                  <Select value={editFormData.category} onValueChange={(value) => onFormDataChange({ ...editFormData, category: value })}>
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
                <Label htmlFor="edit-tags" className="text-sm font-semibold text-slate-700">
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
              <Label htmlFor="edit-notes" className="text-sm font-semibold text-slate-700">
                メモ
              </Label>
              <Input
                id="edit-notes"
                value={editFormData.notes}
                onChange={(e) => onFormDataChange({ ...editFormData, notes: e.target.value })}
                className="h-12 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                className="h-14 flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300"
              >
                更新する
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel} 
                className="h-14 px-8 bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-all duration-300"
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