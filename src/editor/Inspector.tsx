import { boundsOf } from './geometry'
import { useEditor } from './store'

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

export function Inspector() {
  const shapes = useEditor((s) => s.shapes)
  const selectedIds = useEditor((s) => s.selectedIds)
  const selected = shapes.filter((s) => selectedIds.includes(s.id))
  const b = boundsOf(selected)

  return (
    <aside className="inspector" data-testid="inspector">
      <h2>Selection</h2>
      <p data-testid="selection-count">
        {selected.length === 0 ? 'Nothing selected' : `${selected.length} selected`}
      </p>
      {selected.length > 0 && (
        <dl className="bounds">
          <dt>X</dt>
          <dd data-testid="bounds-x">{fmt(b.x)}</dd>
          <dt>Y</dt>
          <dd data-testid="bounds-y">{fmt(b.y)}</dd>
          <dt>W</dt>
          <dd data-testid="bounds-w">{fmt(b.w)}</dd>
          <dt>H</dt>
          <dd data-testid="bounds-h">{fmt(b.h)}</dd>
        </dl>
      )}
      <h2>Layers</h2>
      <ul className="layers">
        {[...shapes].reverse().map((s) => (
          <li
            key={s.id}
            data-testid={`layer-${s.id}`}
            className={selectedIds.includes(s.id) ? 'selected' : undefined}
          >
            <span className="swatch" style={{ background: s.fill }} />
            {s.id} · {s.kind} · {fmt(s.x)}, {fmt(s.y)}
          </li>
        ))}
      </ul>
      <p className="hint">
        Click to select · Shift+click to add · Drag to move · Ctrl+Z / Ctrl+Shift+Z undo / redo
      </p>
    </aside>
  )
}
