interface LoadingSpinnerProps {
  message?: string
}

/**
 * 로딩 스피너 — 데이터 로딩 및 추출 중 표시
 */
export function LoadingSpinner({ message = '불러오는 중...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
