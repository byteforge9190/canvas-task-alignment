import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { SEED_SHAPES } from './seed'
import type { Shape } from './types'

export interface EditorState {
  shapes: Shape[]
  selectedIds: string[]
  past: Shape[][]
  future: Shape[][]

  setSelection: (ids: string[]) => void
  toggleSelected: (id: string) => void
  clearSelection: () => void

  /** Snapshot the current shapes so the next change can be undone as one step. */
  pushHistory: () => void
  undo: () => void
  redo: () => void

  /** Move shapes without touching history (used while dragging). */
  translate: (ids: string[], dx: number, dy: number) => void

  reset: () => void
}

const HISTORY_LIMIT = 100

export const editorStore = createStore<EditorState>()((set) => ({
  shapes: SEED_SHAPES.map((s) => ({ ...s })),
  selectedIds: [],
  past: [],
  future: [],

  setSelection: (ids) => set({ selectedIds: ids }),
  toggleSelected: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),
  clearSelection: () => set({ selectedIds: [] }),

  pushHistory: () =>
    set((s) => ({
      past: [...s.past.slice(-(HISTORY_LIMIT - 1)), s.shapes],
      future: [],
    })),
  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s
      const previous = s.past[s.past.length - 1]
      return { shapes: previous, past: s.past.slice(0, -1), future: [s.shapes, ...s.future] }
    }),
  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s
      const [next, ...rest] = s.future
      return { shapes: next, past: [...s.past, s.shapes], future: rest }
    }),

  translate: (ids, dx, dy) =>
    set((s) => ({
      shapes: s.shapes.map((sh) => (ids.includes(sh.id) ? { ...sh, x: sh.x + dx, y: sh.y + dy } : sh)),
    })),

  reset: () =>
    set({
      shapes: SEED_SHAPES.map((s) => ({ ...s })),
      selectedIds: [],
      past: [],
      future: [],
    }),
}))

export function useEditor<T>(selector: (state: EditorState) => T): T {
  return useStore(editorStore, selector)
}

declare global {
  interface Window {
    /** Test hook: the raw store, read by the Playwright suite. Keep it exposed. */
    __editor: typeof editorStore
  }
}
if (typeof window !== 'undefined') window.__editor = editorStore
