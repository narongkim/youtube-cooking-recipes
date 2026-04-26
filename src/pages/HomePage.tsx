import { useCounterStore } from '../store/useCounterStore'

/**
 * 홈 페이지 컴포넌트
 * Zustand 카운터 스토어를 활용한 예제 UI 포함
 */
function HomePage() {
  const { count, increment, decrement, reset } = useCounterStore()

  return (
    <div className="flex flex-col items-center justify-center gap-10 py-16">
      {/* 페이지 제목 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">React 스타터 키트</h1>
        <p className="text-gray-500 text-lg">
          Vite · React · TypeScript · Tailwind CSS v4 · Zustand
        </p>
      </div>

      {/* 카운터 카드 */}
      <div className="bg-white rounded-2xl shadow-md p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold text-gray-700">카운터 예제</h2>

        {/* 카운트 표시 */}
        <span className="text-6xl font-bold text-indigo-600">{count}</span>

        {/* 조작 버튼 */}
        <div className="flex items-center gap-3">
          <button
            onClick={decrement}
            className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-2xl font-bold transition-colors"
            aria-label="감소"
          >
            −
          </button>
          <button
            onClick={increment}
            className="w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-2xl font-bold transition-colors"
            aria-label="증가"
          >
            +
          </button>
        </div>

        {/* 초기화 버튼 */}
        <button
          onClick={reset}
          className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors"
        >
          초기화
        </button>
      </div>

      {/* 기술 스택 뱃지 */}
      <div className="flex flex-wrap justify-center gap-2">
        {['Vite', 'React 19', 'TypeScript', 'Tailwind v4', 'React Router v7', 'Zustand'].map(
          (tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
            >
              {tech}
            </span>
          )
        )}
      </div>
    </div>
  )
}

export default HomePage
