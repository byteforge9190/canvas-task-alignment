import { describe, expect, it } from 'vitest'
import { alignShapes, boundsOf, distributeShapes, rectsIntersect } from '../../src/editor/geometry'
import type { Shape } from '../../src/editor/types'

const rect = (id: string, x: number, y: number, w: number, h: number): Shape => ({
  id,
  kind: 'rect',
  x,
  y,
  w,
  h,
  fill: '#000',
})

// Same values as src/editor/seed.ts for r1, r2, e1.
const A = rect('r1', 80, 80, 120, 80)
const B = rect('r2', 300, 160, 100, 100)
const C = rect('e1', 520, 90, 140, 90)

describe('boundsOf', () => {
  it('returns the union box of all shapes', () => {
    expect(boundsOf([A, B, C])).toEqual({ x: 80, y: 80, w: 580, h: 180 })
  })
  it('returns a zero box for an empty list', () => {
    expect(boundsOf([])).toEqual({ x: 0, y: 0, w: 0, h: 0 })
  })
})

describe('rectsIntersect', () => {
  it('detects overlap and edge contact, rejects separation', () => {
    expect(rectsIntersect(A, { x: 150, y: 100, w: 50, h: 50 })).toBe(true)
    expect(rectsIntersect(A, { x: 200, y: 160, w: 10, h: 10 })).toBe(true) // touching corner
    expect(rectsIntersect(A, { x: 201, y: 161, w: 10, h: 10 })).toBe(false)
  })
})

describe('alignShapes', () => {
  it('aligns left / right / horizontal centers against the group bounds', () => {
    expect(alignShapes([A, B, C], 'left').map((s) => s.x)).toEqual([80, 80, 80])
    expect(alignShapes([A, B, C], 'right').map((s) => s.x)).toEqual([540, 560, 520])
    expect(alignShapes([A, B, C], 'hcenter').map((s) => s.x)).toEqual([310, 320, 300])
  })

  it('aligns top / bottom / vertical centers against the group bounds', () => {
    expect(alignShapes([A, B, C], 'top').map((s) => s.y)).toEqual([80, 80, 80])
    expect(alignShapes([A, B, C], 'bottom').map((s) => s.y)).toEqual([180, 160, 170])
    expect(alignShapes([A, B, C], 'vcenter').map((s) => s.y)).toEqual([130, 120, 125])
  })

  it('does not mutate the input and preserves order, ids and sizes', () => {
    const input = [A, B, C]
    const out = alignShapes(input, 'left')
    expect(input[0].x).toBe(80)
    expect(out.map((s) => s.id)).toEqual(['r1', 'r2', 'e1'])
    expect(out.map((s) => [s.w, s.h])).toEqual([
      [120, 80],
      [100, 100],
      [140, 90],
    ])
  })

  it('leaves fewer than two shapes unchanged', () => {
    expect(alignShapes([B], 'left')).toEqual([B])
    expect(alignShapes([], 'left')).toEqual([])
  })
})

describe('distributeShapes', () => {
  it('equalises horizontal gaps and keeps the outermost shapes fixed', () => {
    // span 80..660 = 580; widths 120+100+140 = 360; two gaps of 110
    const out = distributeShapes([A, B, C], 'horizontal')
    expect(out.map((s) => s.x)).toEqual([80, 310, 520])
    expect(out.map((s) => s.y)).toEqual([80, 160, 90]) // untouched axis
  })

  it('equalises vertical gaps', () => {
    const top = rect('t', 0, 0, 10, 20)
    const mid = rect('m', 0, 25, 10, 10)
    const bot = rect('b', 0, 100, 10, 30)
    // span 0..130; heights 60; two gaps of 35 → mid.y = 20 + 35 = 55
    expect(distributeShapes([top, mid, bot], 'vertical').map((s) => s.y)).toEqual([0, 55, 100])
  })

  it('sorts by position, not by input order, and returns results in input order', () => {
    const out = distributeShapes([C, A, B], 'horizontal')
    expect(out.map((s) => s.id)).toEqual(['e1', 'r1', 'r2'])
    expect(out.map((s) => s.x)).toEqual([520, 80, 310])
  })

  it('handles four shapes', () => {
    const d = rect('d', 900, 0, 60, 10)
    // span 80..960 = 880; widths 420; three gaps of 153.333…
    const out = distributeShapes([A, B, C, d], 'horizontal')
    const xs = out.map((s) => s.x)
    expect(xs[0]).toBe(80)
    expect(xs[3]).toBe(900)
    expect(xs[1]).toBeCloseTo(80 + 120 + 460 / 3, 6)
    expect(xs[2]).toBeCloseTo(xs[1] + 100 + 460 / 3, 6)
  })

  it('leaves fewer than three shapes unchanged', () => {
    expect(distributeShapes([A, B], 'horizontal')).toEqual([A, B])
  })
})
