import type { Recipe, RecipeFilter, ExtractedRecipe, Category, RecipeStatus } from '@/types'

const DB_ID = '34eff611-850f-80c6-ba91-e7fa4637dabb'
const API_BASE = '/api/notion/v1'

/** Notion API fetch 래퍼 — Vite proxy가 Authorization 헤더를 주입 */
async function notionFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', 'Notion-Version': '2022-06-28' },
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Notion API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

/** 429 응답 시 지수 백오프로 최대 3회 재시도 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (err) {
      const isRateLimit = (err as Error).message?.includes('429')
      if (!isRateLimit || i === maxRetries - 1) throw err
      await new Promise((res) => setTimeout(res, 2 ** i * 1000))
    }
  }
  throw new Error('Notion API 재시도 초과')
}

/** rich_text 배열에서 텍스트 추출 */
function getText(richText: unknown): string {
  if (!Array.isArray(richText)) return ''
  return richText.map((t) => (t as { plain_text?: string }).plain_text ?? '').join('')
}

/** Notion 페이지 객체 → Recipe 타입 변환 */
function notionPageToRecipe(page: unknown): Recipe {
  const p = page as {
    id: string
    created_time: string
    properties: Record<string, unknown>
  }
  const props = p.properties

  const files =
    (props['썸네일'] as { files?: { external?: { url: string }; file?: { url: string } }[] })
      ?.files ?? []
  const thumbnail = files[0]?.external?.url ?? files[0]?.file?.url ?? ''

  return {
    id: p.id,
    title: getText((props['제목'] as { title: unknown })?.title),
    youtubeUrl: (props['유튜브 링크'] as { url: string | null })?.url ?? '',
    channel: getText((props['채널명'] as { rich_text: unknown })?.rich_text),
    thumbnail,
    category:
      ((props['카테고리'] as { select: { name: string } | null })?.select?.name as Category) ??
      '기타',
    ingredients: getText((props['재료'] as { rich_text: unknown })?.rich_text),
    steps: getText((props['조리 절차'] as { rich_text: unknown })?.rich_text),
    favorite: (props['즐겨찾기'] as { checkbox: boolean })?.checkbox ?? false,
    status:
      ((props['상태'] as { select: { name: string } | null })?.select?.name as RecipeStatus) ??
      '저장됨',
    createdAt: p.created_time,
  }
}

/** 레시피 목록 조회 (필터 선택) */
export async function listRecipes(filter?: RecipeFilter): Promise<Recipe[]> {
  const andFilters: unknown[] = []

  if (filter?.search) {
    andFilters.push({
      or: [
        { property: '제목', title: { contains: filter.search } },
        { property: '채널명', rich_text: { contains: filter.search } },
      ],
    })
  }
  if (filter?.category) {
    andFilters.push({ property: '카테고리', select: { equals: filter.category } })
  }
  if (filter?.favoriteOnly) {
    andFilters.push({ property: '즐겨찾기', checkbox: { equals: true } })
  }

  const queryFilter =
    andFilters.length === 1
      ? andFilters[0]
      : andFilters.length > 1
        ? { and: andFilters }
        : undefined

  const response = await withRetry(() =>
    notionFetch<{ results: unknown[] }>(`/databases/${DB_ID}/query`, {
      method: 'POST',
      body: {
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
        ...(queryFilter ? { filter: queryFilter } : {}),
      },
    })
  )

  return response.results.map(notionPageToRecipe)
}

/** 레시피 단건 조회 */
export async function getRecipe(id: string): Promise<Recipe> {
  const page = await withRetry(() => notionFetch<unknown>(`/pages/${id}`))
  return notionPageToRecipe(page)
}

/** 새 레시피 Notion DB에 저장 */
export async function createRecipe(youtubeUrl: string, data: ExtractedRecipe): Promise<Recipe> {
  const page = await withRetry(() =>
    notionFetch<unknown>('/pages', {
      method: 'POST',
      body: {
        parent: { database_id: DB_ID },
        properties: {
          '제목': { title: [{ text: { content: data.title } }] },
          '유튜브 링크': { url: youtubeUrl },
          '채널명': { rich_text: [{ text: { content: data.channel } }] },
          '썸네일': data.thumbnail
            ? { files: [{ name: 'thumbnail', external: { url: data.thumbnail } }] }
            : { files: [] },
          '카테고리': { select: { name: data.category ?? '기타' } },
          '재료': { rich_text: [{ text: { content: data.ingredients.slice(0, 2000) } }] },
          '조리 절차': { rich_text: [{ text: { content: data.steps.slice(0, 2000) } }] },
          '즐겨찾기': { checkbox: false },
          '상태': { select: { name: '저장됨' } },
        },
      },
    })
  )
  return notionPageToRecipe(page)
}

/** 즐겨찾기·상태 업데이트 */
export async function updateRecipe(
  id: string,
  patch: Partial<Pick<Recipe, 'favorite' | 'status'>>
): Promise<void> {
  const properties: Record<string, unknown> = {}
  if (patch.favorite !== undefined) properties['즐겨찾기'] = { checkbox: patch.favorite }
  if (patch.status !== undefined) properties['상태'] = { select: { name: patch.status } }
  await withRetry(() =>
    notionFetch<unknown>(`/pages/${id}`, { method: 'PATCH', body: { properties } })
  )
}
