import { useEffect } from 'react'
import { Canvas } from './editor/Canvas'
import { Inspector } from './editor/Inspector'
import { Toolbar } from './editor/Toolbar'
import { editorStore } from './editor/store'

const NUDGE: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return

      const state = editorStore.getState()
      const mod = e.ctrlKey || e.metaKey

      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) state.redo()
        else state.undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        state.redo()
        return
      }

      const nudge = NUDGE[e.key]
      if (nudge && !mod) {
        if (state.selectedIds.length === 0) return
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        state.nudgeSelected(nudge[0] * step, nudge[1] * step)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

export default function App() {
  useKeyboardShortcuts()
  return (
    <div className="app">
      <Toolbar />
      <main className="workspace">
        <Canvas />
        <Inspector />
      </main>
    </div>
  )
}
