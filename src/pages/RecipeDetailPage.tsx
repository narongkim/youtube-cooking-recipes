import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heart, ExternalLink, ArrowLeft } from 'lucide-react'
import { getRecipe, updateRecipe } from '@/lib/notion'
import { extractVideoId } from '@/lib/youtube'
import { StatusDropdown } from '@/components/ui/StatusDropdown'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { CategoryBadge } from '@/components/ui/CategoryBadge'
import type { Recipe, RecipeStatus } from '@/types'

/** 재료 체크리스트 아이템 — 로컬 체크 상태만 관리 */
function IngredientItem({ label }: { label: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <li className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 accent-indigo-600 cursor-pointer"
      />
      <span className={checked ? 'line-through text-gray-400' : 'text-gray-700'}>{label}</span>
    </li>
  )
}

/**
 * 레시피 상세 페이지 — 영상 임베드, 재료 체크리스트, 조리 절차, 즐겨찾기·상태 토글
 */
function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (id) loadRecipe()
  }, [id])

  async function loadRecipe() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getRecipe(id!)
      setRecipe(data)
    } catch {
      setError('레시피를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  /** 즐겨찾기 토글 — 낙관적 업데이트 후 실패 시 롤백 */
  async function toggleFavorite() {
    if (!recipe || isUpdating) return
    const newFavorite = !recipe.favorite
    setRecipe({ ...recipe, favorite: newFavorite })
    setIsUpdating(true)
    try {
      await updateRecipe(recipe.id, { favorite: newFavorite })
    } catch {
      setRecipe((prev) => (prev ? { ...prev, favorite: !newFavorite } : prev))
    } finally {
      setIsUpdating(false)
    }
  }

  /** 상태 변경 — 낙관적 업데이트 후 실패 시 롤백 */
  async function handleStatusChange(status: RecipeStatus) {
    if (!recipe || isUpdating) return
    const prevStatus = recipe.status
    setRecipe({ ...recipe, status })
    setIsUpdating(true)
    try {
      await updateRecipe(recipe.id, { status })
    } catch {
      setRecipe((prev) => (prev ? { ...prev, status: prevStatus } : prev))
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) return <LoadingSpinner message="레시피를 불러오는 중..." />
  if (error) return <ErrorMessage message={error} onRetry={loadRecipe} />
  if (!recipe) return null

  const videoId = extractVideoId(recipe.youtubeUrl)
  const ingredients = recipe.ingredients.split('\n').filter(Boolean)
  const steps = recipe.steps.split('\n').filter(Boolean)
  const notionUrl = `https://www.notion.so/${recipe.id.replace(/-/g, '')}`

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        목록으로
      </button>

      {/* 헤더 — 모바일: 세로 스택, md+: 가로 정렬 */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-gray-800">{recipe.title}</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{recipe.channel}</span>
            <CategoryBadge category={recipe.category} />
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={toggleFavorite}
            disabled={isUpdating}
            aria-label="즐겨찾기 토글"
            className="transition-colors disabled:opacity-50"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${
                recipe.favorite
                  ? 'fill-red-500 text-red-500'
                  : 'text-gray-400 hover:text-red-400'
              }`}
            />
          </button>
          <StatusDropdown
            value={recipe.status}
            onChange={handleStatusChange}
            disabled={isUpdating}
          />
          <a
            href={notionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Notion에서 열기
          </a>
        </div>
      </div>

      {/* YouTube 임베드 */}
      {videoId && (
        <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={recipe.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 재료 체크리스트 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">재료</h2>
          {ingredients.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {ingredients.map((item, i) => (
                <IngredientItem key={i} label={item} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">재료 정보가 없습니다.</p>
          )}
        </section>

        {/* 조리 절차 번호 목록 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">조리 절차</h2>
          {steps.length > 0 ? (
            <ol className="flex flex-col gap-3">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-400">조리 절차 정보가 없습니다.</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default RecipeDetailPage
