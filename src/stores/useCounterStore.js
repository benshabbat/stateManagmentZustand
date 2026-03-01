import { create } from 'zustand'

const useCounterStore = create((set) => ({
  // STATE - המצב הנוכחי
  count: 0,
 
  // ACTIONS - פעולות שמשנות את ה-state
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
  incrementByAmount: (amount) => set((state) => ({ count: state.count + amount }))
}))

export default useCounterStore