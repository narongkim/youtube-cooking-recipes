# Development Guidelines

## 1. 프로젝트 개요

- **서비스**: 유튜브 요리 레시피 관리 웹 애플리케이션
- **핵심 흐름**: YouTube URL 입력 → 메타데이터·자막 추출 → LLM 구조화 → Notion DB 저장 → 목록·상세 조회
- **현재 구조**: Vite + React 19 SPA (PRD의 Next.js 15 명세와 다름 — **Vite 기반 유지**)
- **참고 문서**: `docs/PRD.md` (기능 명세), `docs/ROADMAP.md` (개발 순서)

---

## 2. 기술 스택

| 영역 | 패키지 | 버전 |
|------|--------|------|
| 빌드 | Vite | 6 |
| UI | React | 19 |
| 언어 | TypeScript | 5.8 |
| 스타일링 | Tailwind CSS (Vite 플러그인) | 4 |
| 라우팅 | React Router DOM | 7 |
| 전역 상태 | Zustand | 5 |
| 외부 API | @notionhq/client, openai (설치 예정) | - |

---

## 3. 디렉토리 구조 규칙

```
src/
├── App.tsx                   # RouterProvider만 포함 — 로직 추가 금지
├── main.tsx                  # 진입점 — 수정 금지
├── index.css                 # Tailwind 글로벌 스타일 (@import "tailwindcss")
├── vite-env.d.ts             # Vite 환경 타입 — 수정 금지
├── assets/                   # 정적 에셋 (이미지, 폰트 등)
├── components/
│   ├── layout/               # Header.tsx, Layout.tsx만 위치 — 다른 컴포넌트 추가 금지
│   └── ui/                   # 재사용 가능 UI 컴포넌트 (RecipeCard, CategoryBadge 등)
├── hooks/                    # 커스텀 훅 (useXxx.ts 패턴)
├── lib/                      # 외부 API 클라이언트 모듈
│   ├── notion.ts             # Notion SDK 래퍼
│   ├── youtube.ts            # YouTube oEmbed + yt-dlp 모듈
│   └── llm.ts                # LLM 파싱 모듈
├── pages/                    # 라우트 단위 페이지 컴포넌트
│   ├── HomePage.tsx          # / — 레시피 목록
│   ├── AddRecipePage.tsx     # /add — 레시피 추가 (예정)
│   ├── RecipeDetailPage.tsx  # /recipe/:id — 상세 (예정)
│   └── NotFoundPage.tsx      # * — 404
├── router/
│   └── index.tsx             # 라우트 정의 중앙 관리 — 유일한 라우터 파일
├── store/                    # Zustand 스토어
│   └── useXxxStore.ts        # 스토어별 1파일
└── types/
    └── index.ts              # 도메인 타입 중앙 정의
```

### 배치 원칙

- **페이지 전용 컴포넌트**: `src/pages/` 하위 폴더 또는 해당 페이지 파일 내 로컬 컴포넌트로 작성
- **재사용 컴포넌트**: `src/components/ui/`에만 위치
- **외부 API 호출**: 반드시 `src/lib/` 모듈을 거쳐야 하며, 페이지/컴포넌트에서 직접 fetch 금지

---

## 4. 라우팅 규칙

### 새 페이지 추가 시 동시 수정 필수 파일
1. `src/pages/XxxPage.tsx` — 페이지 컴포넌트 생성
2. `src/router/index.tsx` — 라우트 등록

### 라우트 등록 패턴

```tsx
// Layout 하위에 포함되는 페이지 (Header 포함)
{
  path: '/',
  element: <Layout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'add', element: <AddRecipePage /> },
    { path: 'recipe/:id', element: <RecipeDetailPage /> },
  ],
}

// 독립 페이지 (Header 없음)
{ path: '*', element: <NotFoundPage /> }
```

### URL 구조 (PRD 기준)

| 경로 | 페이지 |
|------|--------|
| `/` | 레시피 목록 (홈) |
| `/add` | 레시피 추가 |
| `/recipe/:id` | 레시피 상세 (`:id` = Notion 페이지 ID) |

---

## 5. 컴포넌트 작성 규칙

- **함수형 컴포넌트**만 사용, 클래스 컴포넌트 금지
- **파일명**: PascalCase (예: `RecipeCard.tsx`)
- **JSDoc 주석**: 모든 컴포넌트에 한 줄 이상 필수

```tsx
/**
 * 레시피 카드 컴포넌트 — 썸네일·제목·채널·카테고리 표시
 */
function RecipeCard({ recipe }: { recipe: Recipe }) { ... }
```

- **props 타입**: 인라인 또는 `interface XxxProps {}` 로 명시, `any` 금지
- **Tailwind**: 클래스명은 JSX에 직접 작성, 별도 CSS 파일 생성 금지
- **아이콘**: Lucide React 사용 (설치 후 `import { Heart } from 'lucide-react'`)

---

## 6. Tailwind CSS v4 규칙

- **`tailwind.config.js` 생성 금지** — v4는 Vite 플러그인 방식으로 설정 파일 불필요
- 커스텀 테마 색상/폰트는 `src/index.css`의 `@theme` 블록에 추가

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-brand: #4f46e5; /* 커스텀 색상 예시 */
}
```

- 반응형 브레이크포인트: `sm(640px)` / `md(768px)` / `lg(1024px)` / `xl(1280px)`
- 카드 그리드 패턴: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

---

## 7. 상태 관리 규칙

### Zustand 스토어 패턴

```ts
// src/store/useXxxStore.ts
import { create } from 'zustand'

interface XxxState {
  // 상태 필드
  // 액션 함수
}

export const useXxxStore = create<XxxState>((set) => ({
  // 초기값 및 액션 구현
}))
```

- **스토어 파일명**: `useXxxStore.ts` (camelCase, use 접두사 필수)
- **전역 상태 적합**: 여러 페이지에서 공유되는 데이터 (레시피 목록, 필터 상태)
- **로컬 상태 적합**: 단일 컴포넌트 내 UI 상태 (`useState` 사용)
- `useCounterStore.ts`는 스타터 예제 — 레시피 기능 개발 시 삭제하고 `useRecipeStore.ts`로 교체

---

## 8. 외부 API 연동 규칙

### 환경 변수

```env
# .env.local (절대 커밋 금지)
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxx
OPENAI_API_KEY=sk-xxx
```

- **`VITE_` 접두사 사용 절대 금지** — 접두사 없는 변수는 클라이언트 번들에 포함되지 않음
- 환경 변수 추가 시 `.env.example`에도 키 이름(값 없이) 동시 추가

### Notion API (`src/lib/notion.ts`)

- `@notionhq/client` 패키지 사용
- Notion API는 CORS 제한으로 **브라우저에서 직접 호출 불가**
- 개발 환경: `vite.config.ts`의 `server.proxy`로 `/api` 경로를 Notion API로 프록시
- 제공할 함수: `listRecipes()`, `getRecipe(id)`, `createRecipe(data)`, `updateRecipe(id, data)`
- Notion 응답을 `Recipe` 타입으로 변환하는 유틸리티 함수 포함

### YouTube 모듈 (`src/lib/youtube.ts`)

- oEmbed API: `https://www.youtube.com/oembed?url=<URL>&format=json` (키 불필요)
- yt-dlp: 서버 사이드에서만 실행 (클라이언트 번들 포함 금지)
- 자막 없는 영상: 영상 description으로 fallback

### LLM 모듈 (`src/lib/llm.ts`)

- 입력: 자막/설명 텍스트
- 출력: `{ ingredients: string; steps: string }` JSON
- 파싱 실패 시 `{ ingredients: '', steps: '' }` 반환 (예외 throw 금지)
- 자막 전처리: 타임스탬프, 광고 문구 제거 후 전달

---

## 9. 타입 정의 규칙

### `src/types/index.ts` 중앙 관리

```ts
export type Category = '한식' | '양식' | '중식' | '일식' | '기타'
export type RecipeStatus = '저장됨' | '만들어봄' | '보관함'

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
```

- 새 도메인 타입은 반드시 `src/types/index.ts`에 추가
- 컴포넌트 전용 props 타입은 해당 컴포넌트 파일 내 정의 허용

---

## 10. 코드 스타일 규칙

- **변수·함수명**: camelCase 영어 (`recipeList`, `fetchRecipes`)
- **컴포넌트명·타입명**: PascalCase (`RecipeCard`, `RecipeStatus`)
- **상수**: UPPER_SNAKE_CASE (`MAX_ITEMS_PER_PAGE`)
- **주석**: 한국어 작성
- **JSDoc**: 모든 함수·컴포넌트에 한 줄 이상 필수
- **`console.log` 사용 금지** — ESLint로 강제됨

```ts
/** 레시피 목록을 Notion DB에서 가져옴 */
async function fetchRecipes(filter?: RecipeFilter): Promise<Recipe[]> { ... }
```

---

## 11. 파일 간 연동 규칙

| 작업 | 수정 필수 파일 |
|------|--------------|
| 새 페이지 추가 | `src/pages/XxxPage.tsx` (생성) + `src/router/index.tsx` |
| 새 Zustand 스토어 추가 | `src/store/useXxxStore.ts` (생성) |
| 새 도메인 타입 추가 | `src/types/index.ts` |
| 환경 변수 추가 | `.env.local` + `.env.example` |
| Notion DB 필드 변경 | `src/lib/notion.ts` (변환 유틸) + `src/types/index.ts` |
| 새 외부 API 추가 | `src/lib/` 모듈 생성 + `vite.config.ts` proxy 설정 (필요 시) |

---

## 12. AI 의사결정 기준

### 컴포넌트 위치 판단

```
재사용되는가?
├── Yes → src/components/ui/
└── No  → 해당 페이지 파일 내 또는 src/pages/ 하위 폴더
```

### 상태 관리 판단

```
여러 페이지/컴포넌트에서 공유되는가?
├── Yes → Zustand (src/store/)
└── No  → useState 또는 useReducer
```

### API 호출 위치 판단

```
외부 API 호출인가?
├── Yes → src/lib/ 모듈로 추상화 후 훅(src/hooks/) 또는 페이지에서 사용
└── No  → 직접 처리
```

### 스타일 우선순위

1. Tailwind 유틸리티 클래스 (최우선)
2. `src/index.css`의 `@theme` 커스텀 변수
3. 인라인 스타일 (절대 금지)

---

## 13. 금지 사항

- **`any` 타입 사용 금지** — 명시적 타입 또는 `unknown` 사용
- **`console.log` 사용 금지** — ESLint로 오류 처리
- **`tailwind.config.js` 생성 금지** — Tailwind v4 플러그인 방식과 충돌
- **인라인 스타일 (`style={{...}}`) 사용 금지** — Tailwind 클래스 사용
- **API 키를 `VITE_` 접두사로 등록 금지** — 클라이언트 번들에 노출됨
- **페이지/컴포넌트에서 외부 API 직접 호출 금지** — 반드시 `src/lib/` 모듈 경유
- **`src/components/layout/`에 레이아웃 외 컴포넌트 추가 금지**
- **클래스 컴포넌트 사용 금지**
- **`.env.local` 커밋 금지** — `.gitignore`에 포함 확인
- **`useCounterStore.ts` 및 카운터 예제 코드 신규 기능에 재사용 금지** — 삭제 대상
