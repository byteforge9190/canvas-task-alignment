import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { alignShapes, distributeShapes, rectsIntersect } from './geometry'
import { SEED_SHAPES } from './seed'
import type { AlignMode, Axis, Bounds, Shape } from './types'

export interface EditorState {
  shapes: Shape[]
  selectedIds: string[]
  /** Rubber-band rectangle while a marquee drag is in progress, otherwise null. */
  marquee: Bounds | null
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
  /** Move the selection by (dx, dy) as a single undoable step. No-op with an empty selection. */
  nudgeSelected: (dx: number, dy: number) => void

  setMarquee: (rect: Bounds | null) => void
  /** Finish a marquee: select every shape whose box intersects `rect` (added to the selection when `additive`). */
  commitMarquee: (rect: Bounds, additive: boolean) => void

  alignSelected: (mode: AlignMode) => void
  distributeSelected: (axis: Axis) => void

  reset: () => void
}

const HISTORY_LIMIT = 100

function mergeById(all: Shape[], changed: Shape[]): Shape[] {
  const byId = new Map(changed.map((s) => [s.id, s]))
  return all.map((s) => byId.get(s.id) ?? s)
}

export const editorStore = createStore<EditorState>()((set, get) => ({
  shapes: SEED_SHAPES.map((s) => ({ ...s })),
  selectedIds: [],
  marquee: null,
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
  nudgeSelected: (dx, dy) => {
    const { selectedIds, pushHistory, translate } = get()
    if (selectedIds.length === 0) return
    pushHistory()
    translate(selectedIds, dx, dy)
  },

  setMarquee: (rect) => set({ marquee: rect }),
  commitMarquee: (rect, additive) =>
    set((s) => {
      const hits = s.shapes.filter((sh) => rectsIntersect(sh, rect)).map((sh) => sh.id)
      const selectedIds = additive
        ? [...s.selectedIds, ...hits.filter((id) => !s.selectedIds.includes(id))]
        : hits
      return { selectedIds, marquee: null }
    }),

  alignSelected: (mode) => {
    const { shapes, selectedIds, pushHistory } = get()
    if (selectedIds.length < 2) return
    pushHistory()
    const selected = shapes.filter((s) => selectedIds.includes(s.id))
    set({ shapes: mergeById(shapes, alignShapes(selected, mode)) })
  },
  distributeSelected: (axis) => {
    const { shapes, selectedIds, pushHistory } = get()
    if (selectedIds.length < 3) return
    pushHistory()
    const selected = shapes.filter((s) => selectedIds.includes(s.id))
    set({ shapes: mergeById(shapes, distributeShapes(selected, axis)) })
  },

  reset: () =>
    set({
      shapes: SEED_SHAPES.map((s) => ({ ...s })),
      selectedIds: [],
      marquee: null,
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
