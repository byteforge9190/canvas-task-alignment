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
 * Must return a new array in the same order; only `x` or `y` change.
 * With fewer than two shapes return a copy of the input.
 *
 * TODO (TASK.md, Step 2)
 */
export function alignShapes(_shapes: readonly Shape[], _mode: AlignMode): Shape[] {
  throw new Error('Not implemented: alignShapes')
}

/**
 * Distribute shapes so the gaps between neighbours along `axis` are equal.
 * The outermost shapes keep their position. Ties are broken by input order.
 * Must return a new array in the original order; with fewer than three shapes return a copy of the input.
 *
 * TODO (TASK.md, Step 2)
 */
export function distributeShapes(_shapes: readonly Shape[], _axis: Axis): Shape[] {
  throw new Error('Not implemented: distributeShapes')
}
