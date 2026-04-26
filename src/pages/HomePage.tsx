import { useEffect, useState } from 'react'
import { Search, Star } from 'lucide-react'
import { listRecipes } from '@/lib/notion'
import { RecipeCard } from '@/components/ui/RecipeCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { useFilterStore } from '@/store/useFilterStore'
import { useDebounce } from '@/hooks/useDebounce'
import type { Recipe, Category } from '@/types'

const PAGE_SIZE = 12
const CATEGORIES: Category[] = ['한식', '양식', '중식', '일식', '기타']

/**
 * 홈 페이지 — 검색·카테고리·즐겨찾기 필터 + 카드 그리드 + 페이지네이션
 */
function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const { search, category, favoriteOnly, setSearch, setCategory, toggleFavoriteOnly } =
    useFilterStore()
  const debouncedSearch = useDebounce(search, 300)

  /** 필터가 바뀔 때마다 Notion API 재조회 */
  async function loadRecipes() {
    setIsLoading(true)
    setError(null)
    setPage(1)
    try {
      const data = await listRecipes({
        search: debouncedSearch || undefined,
        category: category || undefined,
        favoriteOnly: favoriteOnly || undefined,
      })
      setRecipes(data)
    } catch {
      setError('레시피를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [debouncedSearch, category, favoriteOnly])

  const totalPages = Math.ceil(recipes.length / PAGE_SIZE)
  const pagedRecipes = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        {/* 검색창 */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="레시피 또는 채널명 검색"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 카테고리 드롭다운 */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | '')}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* 즐겨찾기 토글 */}
        <button
          onClick={toggleFavoriteOnly}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border transition-colors ${
            favoriteOnly
              ? 'bg-red-50 border-red-300 text-red-600'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Star className={`w-4 h-4 ${favoriteOnly ? 'fill-red-500 text-red-500' : ''}`} />
          즐겨찾기
        </button>
      </div>

      {/* 로딩 / 에러 */}
      {isLoading && <LoadingSpinner message="레시피를 불러오는 중..." />}
      {error && !isLoading && <ErrorMessage message={error} onRetry={loadRecipes} />}

      {/* 결과 없음 */}
      {!isLoading && !error && recipes.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-gray-400">
          <span className="text-5xl">🍳</span>
          {search || category || favoriteOnly ? (
            <p className="text-base">검색 결과가 없습니다.</p>
          ) : (
            <>
              <p className="text-base">아직 저장된 레시피가 없어요.</p>
              <p className="text-sm">상단의 <strong>+ 레시피 추가</strong> 버튼으로 첫 레시피를 추가해보세요!</p>
            </>
          )}
        </div>
      )}

      {/* 카드 그리드 */}
      {!isLoading && !error && recipes.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pagedRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <span className="text-sm text-gray-600">{page} / {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default HomePage
