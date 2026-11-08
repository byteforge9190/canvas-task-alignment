import { boundsOf } from './geometry'
import { EllipseIcon, RectIcon } from './icons'
import { useEditor } from './store'

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1))

const SHORTCUTS: [string, string][] = [
  ['Click', 'Select'],
  ['Shift + Click', 'Add / remove from selection'],
  ['Drag on empty space', 'Marquee select'],
  ['← ↑ → ↓', 'Nudge 1 px'],
  ['Shift + Arrows', 'Nudge 10 px'],
  ['Ctrl + Z', 'Undo'],
  ['Ctrl + Shift + Z', 'Redo'],
]

export function Inspector() {
  const shapes = useEditor((s) => s.shapes)
  const selectedIds = useEditor((s) => s.selectedIds)
  const selected = shapes.filter((s) => selectedIds.includes(s.id))
  const b = boundsOf(selected)

  return (
    <aside className="inspector" data-testid="inspector">
      <section className="panel">
        <header>
          <h2>Selection</h2>
          <span className="count" data-testid="selection-count">
            {selected.length === 0 ? 'Nothing selected' : `${selected.length} selected`}
          </span>
        </header>
        <div className={`fields${selected.length === 0 ? ' empty' : ''}`}>
          <label>
            <span>X</span>
            <output data-testid="bounds-x">{selected.length ? fmt(b.x) : '—'}</output>
          </label>
          <label>
            <span>Y</span>
            <output data-testid="bounds-y">{selected.length ? fmt(b.y) : '—'}</output>
          </label>
          <label>
            <span>W</span>
            <output data-testid="bounds-w">{selected.length ? fmt(b.w) : '—'}</output>
          </label>
          <label>
            <span>H</span>
            <output data-testid="bounds-h">{selected.length ? fmt(b.h) : '—'}</output>
          </label>
        </div>
      </section>

      <section className="panel">
        <header>
          <h2>Layers</h2>
          <span className="count">{shapes.length}</span>
        </header>
        <ul className="layers">
          {[...shapes].reverse().map((s) => (
            <li
              key={s.id}
              data-testid={`layer-${s.id}`}
              className={selectedIds.includes(s.id) ? 'selected' : undefined}
            >
              <span className="swatch" style={{ background: s.fill }}>
                {s.kind === 'rect' ? <RectIcon /> : <EllipseIcon />}
              </span>
              <span className="layer-name">
                {s.kind === 'rect' ? 'Rectangle' : 'Ellipse'} <em>{s.id}</em>
              </span>
              <span className="layer-pos">
                {fmt(s.x)}, {fmt(s.y)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <header>
          <h2>Shortcuts</h2>
        </header>
        <dl className="shortcuts">
          {SHORTCUTS.map(([keys, what]) => (
            <div key={keys}>
              <dt>
                <kbd>{keys}</kbd>
              </dt>
              <dd>{what}</dd>
            </div>
          ))}
        </dl>
      </section>
    </aside>
  )
}
