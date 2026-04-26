# 🍳 유튜브 요리 레시피 관리

Notion을 CMS로 활용한 유튜브 요리 영상 레시피 자동 수집·관리 웹 서비스입니다.  
유튜브 링크 하나만 입력하면 재료와 조리 절차를 자동으로 추출하여 Notion 데이터베이스에 저장합니다.

## 주요 기능

- **자동 레시피 추출** — 유튜브 URL 입력 시 영상 자막·설명에서 재료·조리 절차를 LLM으로 파싱
- **Notion 연동 저장** — 추출된 레시피를 Notion 데이터베이스에 자동 저장 (비개발자도 Notion에서 직접 편집 가능)
- **레시피 목록·검색** — 카테고리 필터, 텍스트 검색으로 저장된 레시피 빠르게 탐색
- **상세 보기** — 재료 체크리스트, 조리 절차, 유튜브 영상 임베드 제공
- **즐겨찾기·상태 관리** — 즐겨찾기 토글 및 "만들어봄 / 보관함" 상태 추적

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, Vite |
| 스타일링 | Tailwind CSS |
| 상태 관리 | Zustand |
| 라우팅 | React Router v7 |
| CMS | Notion API |
| 영상 정보 수집 | YouTube oEmbed, yt-dlp |
| 레시피 구조화 | LLM API |

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- Notion 계정 및 Integration 토큰
- (선택) LLM API 키

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
```

`.env.local` 파일에 아래 값을 입력합니다.

```env
VITE_NOTION_TOKEN=your_notion_integration_token
VITE_NOTION_DATABASE_ID=your_notion_database_id
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 으로 접속합니다.

### 빌드

```bash
npm run build
```

## 프로젝트 구조

```
notion-cms-project/
├── src/
│   ├── components/        # 공통 UI 컴포넌트
│   │   └── layout/        # Header, Layout
│   ├── pages/             # 페이지 컴포넌트
│   ├── router/            # React Router 설정
│   ├── store/             # Zustand 전역 상태
│   └── main.tsx
├── docs/
│   └── PRD.md             # 제품 요구사항 문서
└── public/
```

## Notion 데이터베이스 스키마

| 필드 | 타입 | 설명 |
|------|------|------|
| 제목 (Title) | Title | 레시피 이름 |
| 유튜브 링크 (YouTube URL) | URL | 원본 영상 주소 |
| 채널명 (Channel) | Text | 채널 이름 |
| 썸네일 (Thumbnail) | Files & media | 영상 썸네일 |
| 카테고리 (Category) | Select | 한식 / 양식 / 중식 / 일식 / 기타 |
| 재료 (Ingredients) | Text | 추출된 재료 목록 |
| 조리 절차 (Steps) | Text | 추출된 조리 순서 |
| 즐겨찾기 (Favorite) | Checkbox | 즐겨찾기 여부 |
| 상태 (Status) | Select | 저장됨 / 만들어봄 / 보관함 |

## 개발 명령어

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
npm run lint     # ESLint 검사
npm run format   # Prettier 포맷팅
```

## 문서

- [PRD (제품 요구사항 문서)](./docs/PRD.md)

## 라이선스

Private
