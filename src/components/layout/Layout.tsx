import { Outlet } from 'react-router-dom'
import Header from './Header'

/**
 * 공통 레이아웃 컴포넌트
 * Header와 Outlet(중첩 라우트 렌더링 영역)으로 구성
 */
function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 공통 헤더 */}
      <Header />

      {/* 페이지 콘텐츠 영역 */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
