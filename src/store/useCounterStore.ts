import { create } from 'zustand'

/** 카운터 상태 타입 정의 */
interface CounterState {
  /** 현재 카운트 값 */
  count: number
  /** 카운트 1 증가 */
  increment: () => void
  /** 카운트 1 감소 */
  decrement: () => void
  /** 카운트 초기화 */
  reset: () => void
}

/**
 * 카운터 전역 상태 스토어
 * Zustand를 사용하여 count 상태와 액션을 관리
 */
export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
