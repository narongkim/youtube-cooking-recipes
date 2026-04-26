import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

/**
 * 오류 메시지 박스 — AlertCircle 아이콘과 재시도 버튼 포함
 */
export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="flex items-center gap-2 text-red-600">
        <AlertCircle className="w-6 h-6 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          다시 시도
        </button>
      )}
    </div>
  )
}
