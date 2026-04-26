import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import type { Recipe } from '@/types'
import { CategoryBadge } from './CategoryBadge'

interface RecipeCardProps {
  recipe: Recipe
}

/**
 * 레시피 카드 — 썸네일·제목·채널·카테고리·즐겨찾기 표시
 */
export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow"
    >
      {/* 썸네일 */}
      <div className="relative aspect-video bg-gray-100">
        {recipe.thumbnail ? (
          <img
            src={recipe.thumbnail}
            alt={recipe.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">
            🍳
          </div>
        )}
        {/* 즐겨찾기 뱃지 */}
        {recipe.favorite && (
          <span className="absolute top-2 right-2">
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </span>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-col gap-1.5 p-3">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {recipe.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">{recipe.channel}</p>
        <CategoryBadge category={recipe.category} />
      </div>
    </Link>
  )
}
