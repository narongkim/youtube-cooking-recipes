import type { Category } from '@/types'

interface CategoryBadgeProps {
  category: Category
}

/** 카테고리별 색상 매핑 */
const COLOR_MAP: Record<Category, string> = {
  한식: 'bg-orange-100 text-orange-700',
  양식: 'bg-blue-100 text-blue-700',
  중식: 'bg-red-100 text-red-700',
  일식: 'bg-green-100 text-green-700',
  기타: 'bg-gray-100 text-gray-600',
}

/**
 * 카테고리 뱃지 — 카테고리별 색상으로 표시
 */
export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${COLOR_MAP[category]}`}
    >
      {category}
    </span>
  )
}
