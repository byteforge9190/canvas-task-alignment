import type { Shape } from './types'

/** Deterministic starting document. Tests and screenshots depend on these exact values. */
export const SEED_SHAPES: Shape[] = [
  { id: 'r1', kind: 'rect', x: 80, y: 80, w: 120, h: 80, fill: '#f97316' },
  { id: 'r2', kind: 'rect', x: 300, y: 160, w: 100, h: 100, fill: '#22c55e' },
  { id: 'e1', kind: 'ellipse', x: 520, y: 90, w: 140, h: 90, fill: '#3b82f6' },
  { id: 'r3', kind: 'rect', x: 700, y: 260, w: 90, h: 140, fill: '#a855f7' },
  { id: 'e2', kind: 'ellipse', x: 240, y: 380, w: 160, h: 100, fill: '#ec4899' },
  { id: 'r4', kind: 'rect', x: 560, y: 400, w: 120, h: 70, fill: '#eab308' },
]

export const CANVAS_WIDTH = 960
export const CANVAS_HEIGHT = 560
