import { Link } from 'react-router-dom'

/**
 * 404 Not Found 페이지 컴포넌트
 * 존재하지 않는 경로 접근 시 표시되며 홈으로 돌아가는 링크 제공
 */
function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
      {/* 404 에러 표시 */}
      <p className="text-8xl font-bold text-indigo-200">404</p>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-500">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      </div>

      {/* 홈으로 돌아가는 링크 */}
      <Link
        to="/"
        className="mt-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}

export default NotFoundPage
