'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Filter } from 'lucide-react'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onAddNew: () => void
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  availableCategories: string[]
}

export default function SearchBar({ searchQuery, onSearchChange, onAddNew, categoryFilter, onCategoryFilterChange, availableCategories }: SearchBarProps) {
  return (
    <div className="mb-6 sm:mb-10">
      <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl shadow-indigo-500/10 border border-white/20 p-4 sm:p-8 mb-6 sm:mb-8 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
        
        <div className="relative">
          <div className="mb-4 sm:mb-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1 sm:mb-2">パスワードを管理</h2>
            <p className="text-sm sm:text-base text-slate-600 px-2">安全で美しく、あなたの大切な情報を守ります</p>
          </div>
          
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-indigo-400">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Input
                placeholder="サービス名、ユーザー名、タグで検索..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 sm:pl-12 h-12 sm:h-14 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 rounded-xl sm:rounded-2xl text-sm sm:text-base placeholder:text-slate-400 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
                <SelectTrigger className="flex-1 sm:w-48 h-12 sm:h-14 bg-gradient-to-r from-slate-50/50 to-white/50 border-slate-200/50 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 rounded-xl sm:rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-indigo-400" />
                    <SelectValue placeholder="カテゴリで絞り込み" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのカテゴリ</SelectItem>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={onAddNew} 
                className="h-12 sm:h-14 px-4 sm:px-8 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">新規追加</span>
                <span className="sm:hidden text-sm">追加</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}