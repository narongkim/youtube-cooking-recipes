import OpenAI from 'openai'

/** LLM 파싱 결과 */
export interface ParsedRecipe {
  ingredients: string
  steps: string
}

/**
 * OpenAI 클라이언트
 * Vite proxy(/api/openai)를 통해 라우팅 — API 키는 proxy에서 서버 측 주입
 */
const openai = new OpenAI({
  apiKey: 'proxy',
  baseURL: `${location.origin}/api/openai/v1`,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `당신은 요리 레시피 추출 전문가입니다.
주어진 텍스트에서 재료 목록과 조리 절차를 추출하세요.

반드시 다음 JSON 형식으로만 응답하세요:
{
  "ingredients": "- 재료1\\n- 재료2\\n...",
  "steps": "1. 첫 번째 단계\\n2. 두 번째 단계\\n..."
}

재료나 조리 절차를 찾을 수 없으면 빈 문자열("")로 반환하세요.`

/** 자막/설명 텍스트 전처리 — 타임스탬프·광고 문구 제거 */
export function preprocessText(text: string): string {
  return text
    .replace(/\[?\d{1,2}:\d{2}(:\d{2})?\]?/g, '') // 타임스탬프 제거
    .replace(/https?:\/\/\S+/g, '')                 // URL 제거
    .replace(/[#＃][\w가-힣]+/g, '')                 // 해시태그 제거
    .replace(/\n{3,}/g, '\n\n')                      // 연속 빈 줄 축소
    .trim()
    .slice(0, 4000)                                  // 토큰 절감용 최대 길이
}

/**
 * 자막/설명 텍스트에서 재료·조리 절차를 LLM으로 파싱
 * 실패 시 빈 구조체 반환 (예외 throw 금지)
 */
export async function parseRecipe(text: string): Promise<ParsedRecipe> {
  const empty: ParsedRecipe = { ingredients: '', steps: '' }

  if (!text.trim()) return empty

  try {
    const processed = preprocessText(text)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: processed },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const content = response.choices[0]?.message?.content
    if (!content) return empty

    const parsed = JSON.parse(content) as Partial<ParsedRecipe>
    return {
      ingredients: parsed.ingredients ?? '',
      steps: parsed.steps ?? '',
    }
  } catch {
    return empty
  }
}
