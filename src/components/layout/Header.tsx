import { NavLink } from 'react-router-dom'

/**
 * 공통 헤더 컴포넌트 — 로고, 레시피 추가 버튼 포함
 */
function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* 서비스 로고 */}
        <NavLink to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
          🍳 유튜브 레시피
        </NavLink>

        {/* 레시피 추가 버튼 */}
        <NavLink
          to="/add"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + 레시피 추가
        </NavLink>
      </div>
    </header>
  )
}

export default Header
