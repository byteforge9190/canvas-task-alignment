import * as I from './icons'
import { useEditor } from './store'
import type { AlignMode, Axis } from './types'

const ALIGN: { mode: AlignMode; label: string; Icon: typeof I.AlignLeft }[] = [
  { mode: 'left', label: 'Align left', Icon: I.AlignLeft },
  { mode: 'hcenter', label: 'Align horizontal centers', Icon: I.AlignHCenter },
  { mode: 'right', label: 'Align right', Icon: I.AlignRight },
  { mode: 'top', label: 'Align top', Icon: I.AlignTop },
  { mode: 'vcenter', label: 'Align vertical centers', Icon: I.AlignVCenter },
  { mode: 'bottom', label: 'Align bottom', Icon: I.AlignBottom },
]

const DISTRIBUTE: { axis: Axis; label: string; Icon: typeof I.DistributeH }[] = [
  { axis: 'horizontal', label: 'Distribute horizontally', Icon: I.DistributeH },
  { axis: 'vertical', label: 'Distribute vertically', Icon: I.DistributeV },
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

      <div className="group" role="group" aria-label="Align">
        <span className="group-label">Align</span>
        {ALIGN.map(({ mode, label, Icon }) => (
          <button
            key={mode}
            data-testid={`align-${mode}`}
            title={label}
            aria-label={label}
            disabled={selectedCount < 2}
            onClick={() => alignSelected(mode)}
          >
            <Icon />
          </button>
        ))}
      </div>

      <div className="group" role="group" aria-label="Distribute">
        <span className="group-label">Distribute</span>
        {DISTRIBUTE.map(({ axis, label, Icon }) => (
          <button
            key={axis}
            data-testid={`distribute-${axis}`}
            title={label}
            aria-label={label}
            disabled={selectedCount < 3}
            onClick={() => distributeSelected(axis)}
          >
            <Icon />
          </button>
        ))}
      </div>

      <div className="spacer" />

      <div className="status">
        <span className="pill">{selectedCount === 0 ? 'No selection' : `${selectedCount} selected`}</span>
        <span className="zoom">100%</span>
      </div>
    </header>
  )
}
