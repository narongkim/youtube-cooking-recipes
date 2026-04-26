# ROADMAP: 유튜브 요리 레시피 관리 서비스

> **문서 버전**: v1.0  
> **작성일**: 2026-04-26  
> **기준 문서**: [PRD v1.0](./PRD.md)  
> **전체 예상 기간**: 약 3주

---

## 개발 순서 한눈에 보기

```
Phase 1          Phase 2-1          Phase 2-2          Phase 3             Phase 4           Phase 5
프로젝트          공통 API            공통               핵심 기능             추가 기능           최적화 및
골격 구축   →    함수 개발     →    컴포넌트 개발  →    개발           →     개발         →     배포
(1~2일)          (1~2일)            (1~2일)            (5~7일)             (3~4일)           (2~3일)
```

> ✅ **골격 → 공통 API → 공통 컴포넌트 → 개별 기능** 순서로 진행

---

## Phase 1. 프로젝트 초기 설정 (골격 구축)

> **왜 먼저 하는가?**  
> 환경 설정과 폴더 구조가 확정되어야 이후 모든 작업의 기준선이 생긴다.  
> 기반 없이 기능 개발을 시작하면 나중에 구조를 뒤엎는 비용이 크다.

**예상 소요 시간**: 1~2일

### 작업 목록

#### 1-1. 프로젝트 골격 설정 (디렉토리 구조 확립)
- 서비스 개발에 필요한 디렉토리 생성 (`src/types/`, `src/lib/`, `src/hooks/`, `src/components/ui/`)
- `vite.config.ts`에 경로 별칭 설정 (`@` → `src/`)
- 스타터 예제 코드 제거 (`useCounterStore.ts`, `HomePage` 카운터 UI)
- 서비스용 빈 `HomePage` 골격 유지

```
src/
├── App.tsx               # RouterProvider 진입점 (변경 없음)
├── main.tsx              # React DOM 진입점 (변경 없음)
├── index.css             # Tailwind 글로벌 스타일 (변경 없음)
├── components/
│   ├── layout/           # Header, Layout (기존 유지)
│   └── ui/               # 공통 UI 컴포넌트 (신규 디렉토리)
├── hooks/                # 커스텀 훅 (신규 디렉토리)
├── lib/                  # 외부 API 클라이언트 (신규 디렉토리)
├── pages/
│   ├── HomePage.tsx      # 골격만 유지 (카운터 예제 제거)
│   └── NotFoundPage.tsx  # 유지
├── router/
│   └── index.tsx         # 라우트 중앙 관리 (유지)
├── store/                # Zustand 스토어 (useCounterStore 제거)
└── types/                # TypeScript 타입 정의 (신규 디렉토리)
```

#### 1-2. UI 라이브러리 설정
- shadcn/ui 초기화 (`npx shadcn@latest init`, Tailwind v4 호환)
- Lucide React 설치
- `tsconfig.app.json`에 경로 별칭 타입 추가

#### 1-3. 환경 변수 구성
- `.env.local` 파일 생성 (`.gitignore`에 포함 확인)
- `.env.example` 파일 작성 (키 이름만 공개)
- `vite.config.ts` `server.proxy`로 Notion API CORS 우회 설정

```env
NOTION_TOKEN=
NOTION_DATABASE_ID=
OPENAI_API_KEY=
```

#### 1-4. Notion Integration 설정
- Notion 워크스페이스에 Integration 생성 및 토큰 발급
- PRD 섹션 4 기준 레시피 데이터베이스 스키마 생성
- Integration을 데이터베이스에 연결(Share) 후 읽기/쓰기 동작 확인

#### 1-5. TypeScript 도메인 타입 정의
- `src/types/index.ts`에 핵심 타입 중앙 정의
- `Recipe`, `Category`, `RecipeStatus`, `RecipeFilter`, `ExtractedRecipe`

### 완료 기준
- [ ] `npm run dev` 실행 시 빈 홈 화면 정상 출력 (카운터 예제 없음)
- [ ] `@/components/...` 경로 별칭 임포트 정상 동작
- [ ] shadcn/ui 컴포넌트 임포트 및 렌더링 확인
- [ ] Notion DB에 테스트 레코드 수동 생성·조회 성공
- [ ] `tsc --noEmit` 오류 없음

---

## Phase 2. 공통 모듈 / 컴포넌트 개발

> **왜 먼저 하는가?**  
> 핵심 기능(Phase 3)은 Notion 클라이언트·YouTube 추출에 의존한다.  
> 공통 API 함수를 먼저 만들고, 그 위에 공통 컴포넌트를 쌓아야 기능 개발 중 중복 코드와 타입 불일치를 막을 수 있다.

**예상 소요 시간**: 2~3일  
**진행 순서**: 공통 API 함수(2-1~2-3) → 공통 컴포넌트(2-4~2-5)

### 작업 목록

#### 2-1. TypeScript 타입 정의 (`src/types/`) — Phase 1에서 완료

```ts
// 핵심 타입 예시
interface Recipe {
  id: string;
  title: string;
  youtubeUrl: string;
  channel: string;
  thumbnail: string;
  category: Category;
  ingredients: string;
  steps: string;
  favorite: boolean;
  status: RecipeStatus;
  createdAt: string;
}

type Category = '한식' | '양식' | '중식' | '일식' | '기타';
type RecipeStatus = '저장됨' | '만들어봄' | '보관함';
```

#### 2-2. Notion API 클라이언트 (`src/lib/notion.ts`)
- `@notionhq/client` SDK 래퍼 작성
- DB 조회(list), 단건 조회(retrieve), 생성(create), 수정(update) 함수
- Notion 응답 → `Recipe` 타입 변환 유틸리티

#### 2-3. YouTube 정보 추출 모듈 (`src/lib/youtube.ts`)
- oEmbed API로 제목·채널·썸네일 수집
- yt-dlp CLI 호출로 자막·설명 텍스트 추출
- 자막 없는 영상은 설명(description)으로 fallback

#### 2-4. LLM 파싱 모듈 (`src/lib/llm.ts`)
- 자막/설명 텍스트 → 재료 목록 + 조리 절차 JSON 파싱
- 입력 토큰 절감을 위한 텍스트 전처리 (불필요한 문장 제거)
- 파싱 실패 시 빈 구조체 반환 (수동 입력 fallback 대비)

#### 2-5. 공통 UI 컴포넌트 (`src/components/ui/`)

| 컴포넌트 | 설명 |
|---------|------|
| `RecipeCard` | 썸네일·제목·채널·카테고리·즐겨찾기 아이콘 포함 카드 |
| `CategoryBadge` | 카테고리 Select 뱃지 |
| `LoadingSpinner` | 추출 중 로딩 인디케이터 |
| `ErrorMessage` | 오류 안내 메시지 박스 |
| `StatusDropdown` | 레시피 상태 변경 드롭다운 |

#### 2-6. 레이아웃 컴포넌트 (`src/components/layout/`)
- `Header`: 서비스 로고, "+ 레시피 추가" 버튼
- `Layout`: 전체 페이지 공통 래퍼

### 완료 기준
- [ ] Notion SDK로 DB 목록 조회 → `Recipe[]` 타입으로 정상 변환
- [ ] YouTube oEmbed 호출 → 제목·채널·썸네일 반환 확인
- [ ] LLM에 샘플 자막 전달 → 재료·절차 JSON 정상 파싱
- [ ] `RecipeCard` 컴포넌트 Storybook 또는 로컬 렌더링 확인

---

## Phase 3. 핵심 기능 개발

> **왜 이 순서인가?**  
> API Route(서버) → 페이지(클라이언트) 순서로 개발해야 한다.  
> UI를 먼저 만들면 데이터 계약(응답 형태)이 확정되지 않아 수정이 반복된다.

**예상 소요 시간**: 5~7일

### 작업 목록

#### 3-1. API Route: 레시피 추출 (`/api/extract`)

```
POST /api/extract
Body: { url: string }
Response: { title, channel, thumbnail, ingredients, steps, category? }
```

- YouTube 메타데이터 수집 → 자막 추출 → LLM 파싱 순서로 파이프라인 구성
- 각 단계 실패 시 적절한 HTTP 에러 코드 반환
- 중복 URL 감지: Notion DB 조회 후 이미 존재하면 `409 Conflict` 반환

#### 3-2. API Route: 레시피 CRUD (`/api/recipes`)

```
GET    /api/recipes          # 목록 조회 (검색·필터 쿼리 파라미터)
POST   /api/recipes          # Notion DB에 레시피 생성
GET    /api/recipes/[id]     # 단건 조회
PATCH  /api/recipes/[id]     # 즐겨찾기·상태 업데이트
```

- Notion API 호출 시 속도 제한(초당 3회) 고려한 재시도 로직 포함

#### 3-3. 레시피 추가 페이지 (`/add`)

흐름: URL 입력 → 추출 중 로딩 → 미리보기 → 저장

```
[YouTube URL 입력창]  [추출하기 버튼]
         ↓ (로딩 스피너)
[썸네일 | 제목 / 채널명]
[카테고리 Select]
[재료 목록 미리보기]
[조리 절차 미리보기]
[저장하기 버튼]  [취소]
```

- 추출 실패 시 수동 입력 폼으로 전환
- 저장 완료 후 홈(`/`)으로 리다이렉트

#### 3-4. 레시피 목록 페이지 (`/`)

- Notion DB 데이터를 4열 카드 그리드로 렌더링
- 최신순 정렬 (기본값)
- 페이지네이션 (12개씩)
- `RecipeCard` 클릭 시 `/recipe/[id]`로 이동

#### 3-5. 레시피 상세 페이지 (`/recipe/[id]`)

- 영상 썸네일 및 YouTube 임베드 플레이어
- 재료 목록 (체크리스트 형태)
- 조리 절차 (번호 목록 형태)
- 즐겨찾기 토글 (Lucide `Heart` 아이콘)
- 상태 변경 드롭다운 (`StatusDropdown`)
- "Notion에서 열기" 외부 링크 버튼

### 완료 기준
- [ ] YouTube URL 입력 → 30초 이내 재료·절차 추출 성공 (5개 영상 테스트)
- [ ] 추출 결과 미리보기 → 저장 → Notion DB 레코드 생성 확인
- [ ] 홈 화면에서 저장된 레시피 카드 목록 정상 출력
- [ ] 상세 페이지에서 재료·절차·영상 임베드 정상 렌더링
- [ ] 즐겨찾기·상태 변경 → Notion DB 즉시 반영 확인

---

## Phase 4. 추가 기능 개발

> **왜 이 순서인가?**  
> 핵심 흐름(추출→저장→조회)이 동작한 뒤에야 사용성을 높이는 부가 기능을 올려야 한다.  
> 검색·필터가 없어도 서비스는 돌아가지만, 저장 기능이 없으면 검색할 데이터 자체가 없다.

**예상 소요 시간**: 3~4일

### 작업 목록

#### 4-1. 검색 기능
- 홈 화면 상단 검색창 구현
- Notion API 필터: 제목·채널명 텍스트 포함 검색
- 검색어 입력 후 Enter 또는 디바운스(300ms) 적용

#### 4-2. 카테고리 필터
- 카테고리 드롭다운 Select 구현 (전체 / 한식 / 양식 / 중식 / 일식 / 기타)
- Notion API `filter.select` 쿼리 연동
- 검색어 + 카테고리 동시 필터링 지원

#### 4-3. 즐겨찾기 필터
- 홈 화면 "즐겨찾기만 보기" 토글 버튼
- Notion API `filter.checkbox` 쿼리 연동

#### 4-4. 오류 처리 및 사용자 안내 강화

| 상황 | 처리 |
|------|------|
| 자막 없는 영상 | "자막을 찾을 수 없어 설명 텍스트로 추출했습니다" 안내 |
| 비공개/삭제 영상 | "접근할 수 없는 영상입니다. URL을 확인해 주세요" |
| LLM 추출 실패 | 수동 입력 폼 자동 전환 |
| 중복 URL | "이미 저장된 레시피입니다" + 기존 레시피 링크 표시 |

#### 4-5. 후순위 기능 (시간 여유 시 추가)
> PRD 섹션 7.2 기준 — MVP 이후 선택적 구현

- [ ] 쇼핑 목록 내보내기 (선택한 레시피 재료 합산)
- [ ] 소셜 공유 (레시피 카드 이미지 생성)
- [ ] 고급 필터링 (날짜 범위, 복합 조건)
- [ ] 레시피 직접 편집 UI

### 완료 기준
- [ ] 검색어 입력 → 제목·채널명 기준 필터링 결과 정상 출력
- [ ] 카테고리 선택 → 해당 카테고리 레시피만 표시
- [ ] 즐겨찾기 필터 토글 → 즐겨찾기 레시피만 표시
- [ ] 모든 오류 상황에서 사용자에게 안내 메시지 정상 표시

---

## Phase 5. 최적화 및 배포

> **왜 마지막인가?**  
> 기능이 완성된 뒤 병목을 측정하고 실제 데이터 기준으로 최적화해야 한다.  
> 기능 개발 중 최적화를 먼저 하면 없어질 코드를 최적화하는 낭비가 생긴다.

**예상 소요 시간**: 2~3일

### 작업 목록

#### 5-1. 성능 최적화

| 항목 | 방법 |
|------|------|
| 레시피 목록 로딩 ≤ 2초 | Next.js `fetch` 캐싱 + ISR(Incremental Static Regeneration) 적용 |
| 이미지 최적화 | `next/image`로 썸네일 lazy load 및 WebP 변환 |
| Notion API 속도 제한 대응 | 요청 큐잉 + 지수 백오프(exponential backoff) 재시도 |
| LLM 토큰 절감 | 자막 전처리: 광고 문구·타임스탬프 제거 후 전달 |

#### 5-2. 반응형 UI 점검
- 모바일(375px), 태블릿(768px), 데스크톱(1280px) 레이아웃 확인
- 카드 그리드: 모바일 1열 → 태블릿 2열 → 데스크톱 4열

#### 5-3. 환경 변수 및 보안 점검
- 서버 전용 환경 변수(`NOTION_TOKEN`, `OPENAI_API_KEY`)가 클라이언트에 노출되지 않는지 확인
- API Route에 기본 요청 검증 (빈 URL, 잘못된 YouTube URL 형식 등)

#### 5-4. Vercel 배포
- Vercel 프로젝트 연결 및 GitHub 자동 배포 설정
- Production 환경 변수 등록
- 배포 후 전체 기능 E2E 확인

#### 5-5. 문서 정리
- `README.md` 배포 URL 및 설치 가이드 최종 업데이트
- Notion DB 스키마 설정 방법 가이드 추가

### 완료 기준
- [ ] 레시피 목록 첫 로딩 시간 ≤ 2초 (Lighthouse 측정)
- [ ] 유튜브 링크 → 레시피 추출 성공률 ≥ 80% (10개 영상 테스트)
- [ ] Notion 저장 성공률 ≥ 99%
- [ ] Vercel 배포 URL에서 전체 흐름 E2E 정상 동작
- [ ] 모바일·태블릿·데스크톱 레이아웃 이상 없음

---

## 전체 일정 요약

| Phase | 내용 | 예상 기간 | 누적 |
|-------|------|----------|------|
| Phase 1 | 프로젝트 초기 설정 | 1~2일 | 2일 |
| Phase 2 | 공통 모듈/컴포넌트 개발 | 2~3일 | 5일 |
| Phase 3 | 핵심 기능 개발 | 5~7일 | 12일 |
| Phase 4 | 추가 기능 개발 | 3~4일 | 16일 |
| Phase 5 | 최적화 및 배포 | 2~3일 | **최대 19일** |

---

## 관련 문서

- [PRD (제품 요구사항 문서)](./PRD.md)
