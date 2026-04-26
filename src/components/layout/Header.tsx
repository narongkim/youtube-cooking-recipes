import { NavLink } from 'react-router-dom'

/**
 * 공통 헤더 컴포넌트
 * 네비게이션 링크와 사이트 제목을 포함
 */
function Header() {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* 사이트 로고/제목 */}
        <NavLink to="/" className="text-xl font-bold text-indigo-600 hover:text-indigo-700">
          My Starter Kit
        </NavLink>

        {/* 네비게이션 메뉴 */}
        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-500'
              }`
            }
          >
            Home
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
