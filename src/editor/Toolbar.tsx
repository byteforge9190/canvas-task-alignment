import * as I from './icons'
import { useEditor } from './store'

export function Toolbar() {
  const selectedCount = useEditor((s) => s.selectedIds.length)
  const canUndo = useEditor((s) => s.past.length > 0)
  const canRedo = useEditor((s) => s.future.length > 0)
  const undo = useEditor((s) => s.undo)
  const redo = useEditor((s) => s.redo)

  return (
    <header className="toolbar" data-testid="toolbar">
      <div className="brand">
        <I.Logo />
        <span>Canvas Editor</span>
        <span className="doc-name">Untitled board</span>
      </div>

      <div className="group" role="group" aria-label="Tools">
        <button className="active" title="Select (V)" aria-label="Select tool" aria-pressed="true">
          <I.Pointer />
        </button>
      </div>

      <div className="group" role="group" aria-label="History">
        <button data-testid="undo" title="Undo (Ctrl+Z)" aria-label="Undo" disabled={!canUndo} onClick={undo}>
          <I.Undo />
        </button>
        <button data-testid="redo" title="Redo (Ctrl+Shift+Z)" aria-label="Redo" disabled={!canRedo} onClick={redo}>
          <I.Redo />
        </button>
      </div>

      {/*
        TODO (TASK.md, Step 2): add an "Align" group (6 buttons) and a "Distribute" group (2 buttons).
        Icons are ready in ./icons.tsx (AlignLeft … DistributeV). Use the data-testids listed in TASK.md.
      */}

      <div className="spacer" />

      <div className="status">
        <span className="pill">{selectedCount === 0 ? 'No selection' : `${selectedCount} selected`}</span>
        <span className="zoom">100%</span>
      </div>
    </header>
  )
}
