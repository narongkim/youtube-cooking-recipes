import { RouterProvider } from 'react-router-dom'
import { router } from './router'

/**
 * 앱 루트 컴포넌트
 * RouterProvider를 통해 라우터 설정 적용
 */
function App() {
  return <RouterProvider router={router} />
}

export default App
