import type { AlignMode, Axis, Bounds, Shape } from './types'

/** Axis-aligned bounding box of a set of shapes. Returns a zero box for an empty list. */
export function boundsOf(shapes: readonly Bounds[]): Bounds {
  if (shapes.length === 0) return { x: 0, y: 0, w: 0, h: 0 }
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const s of shapes) {
    minX = Math.min(minX, s.x)
    minY = Math.min(minY, s.y)
    maxX = Math.max(maxX, s.x + s.w)
    maxY = Math.max(maxY, s.y + s.h)
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
}

/** True when the two boxes overlap by a positive area or touch along an edge. */
export function rectsIntersect(a: Bounds, b: Bounds): boolean {
  return a.x <= b.x + b.w && b.x <= a.x + a.w && a.y <= b.y + b.h && b.y <= a.y + a.h
}

/** Normalise a drag from `start` to `end` into a box with non-negative size. */
export function normalizeRect(start: { x: number; y: number }, end: { x: number; y: number }): Bounds {
  return {
    x: Math.min(start.x, end.x),
    y: Math.min(start.y, end.y),
    w: Math.abs(end.x - start.x),
    h: Math.abs(end.y - start.y),
  }
}

/**
 * Align shapes against the bounding box of the whole group.
 * Returns a new array in the same order; only `x` or `y` change.
 * With fewer than two shapes the input is returned unchanged.
 */
export function alignShapes(shapes: readonly Shape[], mode: AlignMode): Shape[] {
  if (shapes.length < 2) return [...shapes]
  const b = boundsOf(shapes)
  return shapes.map((s) => {
    switch (mode) {
      case 'left':
        return { ...s, x: b.x }
      case 'hcenter':
        return { ...s, x: b.x + (b.w - s.w) / 2 }
      case 'right':
        return { ...s, x: b.x + b.w - s.w }
      case 'top':
        return { ...s, y: b.y }
      case 'vcenter':
        return { ...s, y: b.y + (b.h - s.h) / 2 }
      case 'bottom':
        return { ...s, y: b.y + b.h - s.h }
    }
  })
}

/**
 * Distribute shapes so the gaps between neighbours along `axis` are equal.
 * The outermost shapes (first and last after sorting along the axis) keep their position.
 * Ties are broken by the shapes' order in the input array.
 * Returns a new array in the original order; with fewer than three shapes the input is returned unchanged.
 */
export function distributeShapes(shapes: readonly Shape[], axis: Axis): Shape[] {
  if (shapes.length < 3) return [...shapes]
  const pos = axis === 'horizontal' ? 'x' : 'y'
  const size = axis === 'horizontal' ? 'w' : 'h'

  const sorted = shapes
    .map((s, index) => ({ s, index }))
    .sort((a, b) => a.s[pos] - b.s[pos] || a.index - b.index)

  const first = sorted[0].s
  const last = sorted[sorted.length - 1].s
  const span = last[pos] + last[size] - first[pos]
  const total = sorted.reduce((sum, { s }) => sum + s[size], 0)
  const gap = (span - total) / (sorted.length - 1)

  const next = new Map<string, number>()
  let cursor = first[pos]
  for (const { s } of sorted) {
    next.set(s.id, cursor)
    cursor += s[size] + gap
  }
  // Pin the outermost shapes exactly; accumulated floating-point error must not move them.
  next.set(first.id, first[pos])
  next.set(last.id, last[pos])
  return shapes.map((s) => ({ ...s, [pos]: next.get(s.id)! }))
}
