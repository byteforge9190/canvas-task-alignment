import { useEffect } from 'react'
import { Canvas } from './editor/Canvas'
import { Inspector } from './editor/Inspector'
import { Toolbar } from './editor/Toolbar'
import { editorStore } from './editor/store'

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

      // TODO (TASK.md, Step 3): arrow-key nudge.
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
