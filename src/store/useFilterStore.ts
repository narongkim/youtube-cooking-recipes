import { create } from 'zustand'
import type { Category } from '@/types'

interface FilterState {
  search: string
  category: Category | ''
  favoriteOnly: boolean
  setSearch: (search: string) => void
  setCategory: (category: Category | '') => void
  toggleFavoriteOnly: () => void
  reset: () => void
}

/**
 * 레시피 목록 필터 전역 상태
 */
export const useFilterStore = create<FilterState>((set) => ({
  search: '',
  category: '',
  favoriteOnly: false,
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  toggleFavoriteOnly: () => set((s) => ({ favoriteOnly: !s.favoriteOnly })),
  reset: () => set({ search: '', category: '', favoriteOnly: false }),
}))
