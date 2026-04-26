/** 레시피 카테고리 */
export type Category = '한식' | '양식' | '중식' | '일식' | '기타'

/** 레시피 상태 */
export type RecipeStatus = '저장됨' | '만들어봄' | '보관함'

/** Notion DB에 저장된 레시피 */
export interface Recipe {
  id: string
  title: string
  youtubeUrl: string
  channel: string
  thumbnail: string
  category: Category
  ingredients: string
  steps: string
  favorite: boolean
  status: RecipeStatus
  createdAt: string
}

/** 레시피 목록 필터 조건 */
export interface RecipeFilter {
  search?: string
  category?: Category
  favoriteOnly?: boolean
}

/** YouTube에서 추출한 레시피 데이터 (저장 전 미리보기용) */
export interface ExtractedRecipe {
  title: string
  channel: string
  thumbnail: string
  ingredients: string
  steps: string
  category?: Category
}
