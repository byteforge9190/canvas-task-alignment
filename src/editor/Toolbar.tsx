import { useEditor } from './store'

export function Toolbar() {
  const canUndo = useEditor((s) => s.past.length > 0)
  const canRedo = useEditor((s) => s.future.length > 0)
  const undo = useEditor((s) => s.undo)
  const redo = useEditor((s) => s.redo)

  return (
    <header className="toolbar" data-testid="toolbar">
      <span className="brand">Canvas Editor</span>

      <div className="group" role="group" aria-label="History">
        <button data-testid="undo" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
          ↶
        </button>
        <button data-testid="redo" title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
          ↷
        </button>
      </div>

      {/* TODO (TASK.md, Step 2): "Align" group (6 buttons) and "Distribute" group (2 buttons). */}
    </header>
  )
}
