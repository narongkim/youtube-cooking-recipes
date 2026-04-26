import { useEffect, useState } from 'react'

/**
 * 값이 변경된 후 delay ms 동안 변화가 없을 때만 업데이트된 값을 반환
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
