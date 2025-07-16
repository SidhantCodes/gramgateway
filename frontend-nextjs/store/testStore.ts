import { create } from 'zustand'

interface TestState {
  test: string
  setTest: (test: string) => void
}

export const useTestStore = create<TestState>((set) => ({
  test: 'hello',
  setTest: (test: string) => set({ test })
}))
