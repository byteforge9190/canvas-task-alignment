import { useEditor } from './store'
import type { AlignMode, Axis } from './types'

const ALIGN: { mode: AlignMode; label: string; glyph: string }[] = [
  { mode: 'left', label: 'Align left', glyph: '⇤' },
  { mode: 'hcenter', label: 'Align horizontal centers', glyph: '⇹' },
  { mode: 'right', label: 'Align right', glyph: '⇥' },
  { mode: 'top', label: 'Align top', glyph: '⤒' },
  { mode: 'vcenter', label: 'Align vertical centers', glyph: '⇳' },
  { mode: 'bottom', label: 'Align bottom', glyph: '⤓' },
]

const DISTRIBUTE: { axis: Axis; label: string; glyph: string }[] = [
  { axis: 'horizontal', label: 'Distribute horizontally', glyph: '⫼' },
  { axis: 'vertical', label: 'Distribute vertically', glyph: '☰' },
]

export function Toolbar() {
  const selectedCount = useEditor((s) => s.selectedIds.length)
  const canUndo = useEditor((s) => s.past.length > 0)
  const canRedo = useEditor((s) => s.future.length > 0)
  const undo = useEditor((s) => s.undo)
  const redo = useEditor((s) => s.redo)
  const alignSelected = useEditor((s) => s.alignSelected)
  const distributeSelected = useEditor((s) => s.distributeSelected)

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

      <div className="group" role="group" aria-label="Align">
        {ALIGN.map(({ mode, label, glyph }) => (
          <button
            key={mode}
            data-testid={`align-${mode}`}
            title={label}
            aria-label={label}
            disabled={selectedCount < 2}
            onClick={() => alignSelected(mode)}
          >
            {glyph}
          </button>
        ))}
      </div>

      <div className="group" role="group" aria-label="Distribute">
        {DISTRIBUTE.map(({ axis, label, glyph }) => (
          <button
            key={axis}
            data-testid={`distribute-${axis}`}
            title={label}
            aria-label={label}
            disabled={selectedCount < 3}
            onClick={() => distributeSelected(axis)}
          >
            {glyph}
          </button>
        ))}
      </div>
    </header>
  )
}
