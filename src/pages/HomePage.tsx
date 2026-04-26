import { useEffect, useState } from 'react'
import { listRecipes } from '@/lib/notion'
import { RecipeCard } from '@/components/ui/RecipeCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import type { Recipe } from '@/types'

const PAGE_SIZE = 12

/**
 * 홈 페이지 — Notion DB 레시피를 카드 그리드 + 페이지네이션으로 표시
 */
function HomePage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  /** 레시피 목록 로드 */
  async function loadRecipes() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await listRecipes()
      setRecipes(data)
    } catch {
      setError('레시피를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecipes()
  }, [])

  /** 현재 페이지 레시피 슬라이스 */
  const totalPages = Math.ceil(recipes.length / PAGE_SIZE)
  const pagedRecipes = recipes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (isLoading) return <LoadingSpinner message="레시피를 불러오는 중..." />
  if (error) return <ErrorMessage message={error} onRetry={loadRecipes} />

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 레시피가 없을 때 */}
      {recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-gray-400">
          <span className="text-5xl">🍳</span>
          <p className="text-base">아직 저장된 레시피가 없어요.</p>
          <p className="text-sm">상단의 <strong>+ 레시피 추가</strong> 버튼으로 첫 레시피를 추가해보세요!</p>
        </div>
      ) : (
        <>
          {/* 카드 그리드 */}
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
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
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
