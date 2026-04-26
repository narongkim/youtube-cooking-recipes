import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { extractVideoId, isValidYoutubeUrl, fetchMetadata } from '@/lib/youtube'
import { parseRecipe } from '@/lib/llm'
import { createRecipe } from '@/lib/notion'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import type { ExtractedRecipe, Category } from '@/types'

const CATEGORIES: Category[] = ['한식', '양식', '중식', '일식', '기타']

/**
 * 레시피 추가 페이지 — URL 입력 → 추출 미리보기 → Notion 저장
 */
function AddRecipePage() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<ExtractedRecipe | null>(null)

  /** YouTube URL에서 메타데이터 + 레시피 추출 */
  async function handleExtract() {
    if (!isValidYoutubeUrl(url)) {
      setError('유효한 YouTube URL을 입력해주세요.')
      return
    }

    setIsExtracting(true)
    setError(null)
    setPreview(null)

    try {
      const videoId = extractVideoId(url)!
      const metadata = await fetchMetadata(videoId)
      const parsed = await parseRecipe('')

      setPreview({
        title: metadata.title,
        channel: metadata.channel,
        thumbnail: metadata.thumbnail,
        ingredients: parsed.ingredients,
        steps: parsed.steps,
        category: '기타',
      })
    } catch {
      setError('영상 정보를 불러오지 못했습니다. URL을 확인하거나 잠시 후 다시 시도해주세요.')
    } finally {
      setIsExtracting(false)
    }
  }

  /** Notion DB에 레시피 저장 */
  async function handleSave() {
    if (!preview) return
    setIsSaving(true)
    setError(null)
    try {
      await createRecipe(url, preview)
      navigate('/')
    } catch {
      setError('저장 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  /** 미리보기 필드 수정 핸들러 */
  function updatePreview(patch: Partial<ExtractedRecipe>) {
    setPreview((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">레시피 추가</h1>

      {/* URL 입력 */}
      <div className="flex gap-2 mb-6">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
          placeholder="YouTube URL을 입력하세요"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleExtract}
          disabled={isExtracting || !url}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          추출하기
        </button>
      </div>

      {/* 로딩 */}
      {isExtracting && <LoadingSpinner message="영상 정보를 추출하는 중..." />}

      {/* 오류 */}
      {error && !isExtracting && (
        <ErrorMessage message={error} onRetry={preview ? undefined : handleExtract} />
      )}

      {/* 미리보기 */}
      {preview && !isExtracting && (
        <div className="flex flex-col gap-5 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          {/* 썸네일 + 기본 정보 */}
          <div className="flex gap-4">
            {preview.thumbnail && (
              <img
                src={preview.thumbnail}
                alt={preview.title}
                className="w-40 h-24 object-cover rounded-lg shrink-0"
              />
            )}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <input
                value={preview.title}
                onChange={(e) => updatePreview({ title: e.target.value })}
                className="text-base font-semibold text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 rounded"
              />
              <p className="text-sm text-gray-500 truncate">{preview.channel}</p>
              {/* 카테고리 선택 */}
              <select
                value={preview.category ?? '기타'}
                onChange={(e) => updatePreview({ category: e.target.value as Category })}
                className="w-28 text-sm border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 재료 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">재료</label>
            <textarea
              value={preview.ingredients}
              onChange={(e) => updatePreview({ ingredients: e.target.value })}
              rows={5}
              placeholder="재료를 입력하세요 (추출되지 않은 경우 직접 입력)"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          {/* 조리 절차 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">조리 절차</label>
            <textarea
              value={preview.steps}
              onChange={(e) => updatePreview({ steps: e.target.value })}
              rows={7}
              placeholder="조리 절차를 입력하세요 (추출되지 않은 경우 직접 입력)"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            />
          </div>

          {/* 저장 / 취소 */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {isSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddRecipePage
