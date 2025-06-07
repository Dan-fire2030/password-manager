'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Eye, EyeOff, Edit, Trash2, Users } from 'lucide-react'

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

interface PasswordEntryCardProps {
  entry: PasswordEntry
  showPassword: boolean
  onTogglePassword: () => void
  onCopyUsername: () => void
  onCopyPassword: () => void
  onCopyBoth: () => void
  onEdit: () => void
  onDelete: () => void
  getTagColor: (tag: string) => string
}

export default function PasswordEntryCard({
  entry,
  showPassword,
  onTogglePassword,
  onCopyUsername,
  onCopyPassword,
  onCopyBoth,
  onEdit,
  onDelete,
  getTagColor
}: PasswordEntryCardProps) {
  return (
    <div className="group relative animate-fade-in-up">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
      <Card className="relative bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-500 border-0 shadow-lg hover:shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden transform hover:scale-[1.02] hover:-translate-y-1">
        <CardHeader className="pb-3 sm:pb-4 bg-gradient-to-br from-slate-50/50 to-white/50 border-b border-slate-100/50 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent truncate">
                {entry.service}
              </span>
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0">
              {entry.category}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex-shrink-0"></div>
                <p className="text-xs sm:text-sm font-bold text-slate-700 truncate">
                  {entry.usernameType === 'email' ? 'メールアドレス' : 
                   entry.usernameType === 'id' ? 'ID' : 'ユーザー名'}
                </p>
              </div>
            </div>
            <div className="relative">
              <p className="font-mono text-xs sm:text-sm bg-gradient-to-r from-slate-50 to-blue-50/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200/50 truncate backdrop-blur-sm">
                {entry.username}
              </p>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex-shrink-0"></div>
                <p className="text-xs sm:text-sm font-bold text-slate-700">パスワード</p>
              </div>
              <div className="flex gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onTogglePassword}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all duration-300 transform hover:scale-110"
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-300 transform hover:scale-110"
                >
                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 transform hover:scale-110"
                >
                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <p className="font-mono text-xs sm:text-sm bg-gradient-to-r from-slate-50 to-purple-50/50 p-2 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200/50 backdrop-blur-sm break-all">
                {showPassword ? entry.password : '••••••••••••'}
              </p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-center">
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyBoth}
                  className="h-8 sm:h-9 px-3 sm:px-4 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200 hover:from-violet-100 hover:to-purple-100 text-violet-700 hover:text-violet-800 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
                >
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  両方コピー
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyUsername}
                  className="h-8 sm:h-9 px-3 sm:px-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:from-blue-100 hover:to-indigo-100 text-blue-700 hover:text-blue-800 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  ID
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyPassword}
                  className="h-8 sm:h-9 px-3 sm:px-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 hover:from-emerald-100 hover:to-teal-100 text-emerald-700 hover:text-emerald-800 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm"
                >
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  パスワード
                </Button>
              </div>
            </div>
          </div>
          {entry.tags.length > 0 && (
            <div className="flex gap-1 sm:gap-2 flex-wrap pt-1 sm:pt-2">
              {entry.tags.map((tag, i) => (
                <Badge 
                  key={i} 
                  className={`bg-gradient-to-r ${getTagColor(tag)} px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold hover:opacity-80 transition-all duration-300 transform hover:scale-105`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {entry.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 italic break-words">
                {entry.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}