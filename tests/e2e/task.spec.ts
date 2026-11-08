import { expect, test, type Page } from '@playwright/test'

/**
 * End-to-end acceptance tests for TASK.md.
 * They drive the real UI (pointer + keyboard) and assert on the editor store
 * through the `window.__editor` test hook, so they verify behaviour, not pixels.
 */

type Snapshot = { selectedIds: string[]; marquee: unknown; shapes: { id: string; x: number; y: number }[]; past: number; future: number }

async function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => {
    const s = window.__editor.getState()
    return {
      selectedIds: s.selectedIds,
      marquee: s.marquee,
      shapes: s.shapes.map((sh) => ({ id: sh.id, x: sh.x, y: sh.y })),
      past: s.past.length,
      future: s.future.length,
    }
  })
}

async function pos(page: Page, id: string) {
  const s = await snapshot(page)
  return s.shapes.find((sh) => sh.id === id)!
}

async function canvasOrigin(page: Page) {
  const box = await page.getByTestId('editor-canvas').boundingBox()
  if (!box) throw new Error('canvas not found')
  return { x: box.x, y: box.y }
}

/** Drag on the canvas using canvas-local coordinates. */
async function dragOnCanvas(page: Page, from: [number, number], to: [number, number], opts: { shift?: boolean } = {}) {
  const o = await canvasOrigin(page)
  if (opts.shift) await page.keyboard.down('Shift')
  await page.mouse.move(o.x + from[0], o.y + from[1])
  await page.mouse.down()
  // a couple of intermediate moves so pointermove fires like a real drag
  await page.mouse.move(o.x + (from[0] + to[0]) / 2, o.y + (from[1] + to[1]) / 2, { steps: 4 })
  await page.mouse.move(o.x + to[0], o.y + to[1], { steps: 4 })
  await page.mouse.up()
  if (opts.shift) await page.keyboard.up('Shift')
}

async function clickCanvas(page: Page, at: [number, number], opts: { shift?: boolean } = {}) {
  const o = await canvasOrigin(page)
  if (opts.shift) await page.keyboard.down('Shift')
  await page.mouse.click(o.x + at[0], o.y + at[1])
  if (opts.shift) await page.keyboard.up('Shift')
}

// Seed positions (src/editor/seed.ts): r1 80,80 120x80 · r2 300,160 100x100 · e1 520,90 140x90
const INSIDE_R1: [number, number] = [140, 120]
const INSIDE_R2: [number, number] = [350, 210]
const INSIDE_E1: [number, number] = [590, 135]

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('editor-canvas')).toBeVisible()
  await page.evaluate(() => window.__editor.getState().reset())
})

test.describe('Step 1 — marquee selection', () => {
  test('dragging on empty canvas selects every shape the box intersects', async ({ page }) => {
    // Box 40,40 → 460,300 overlaps r1 and r2 only (e1 starts at x=520, e2 at y=380).
    await dragOnCanvas(page, [40, 40], [460, 300])
    const s = await snapshot(page)
    expect(s.selectedIds).toEqual(['r1', 'r2'])
    expect(s.marquee).toBeNull()
    await expect(page.getByTestId('selection-count')).toHaveText('2 selected')
  })

  test('a shape that is only partially inside the box is still selected', async ({ page }) => {
    // Box ends at x=100, cutting through r1 (80..200) without containing it.
    await dragOnCanvas(page, [20, 20], [100, 200])
    expect((await snapshot(page)).selectedIds).toEqual(['r1'])
  })

  test('the marquee rectangle is exposed in state while dragging and cleared on release', async ({ page }) => {
    const o = await canvasOrigin(page)
    await page.mouse.move(o.x + 40, o.y + 40)
    await page.mouse.down()
    await page.mouse.move(o.x + 250, o.y + 220, { steps: 5 })
    expect((await snapshot(page)).marquee).toEqual({ x: 40, y: 40, w: 210, h: 180 })
    await page.mouse.up()
    expect((await snapshot(page)).marquee).toBeNull()
  })

  test('dragging upward/leftward normalises the box', async ({ page }) => {
    await dragOnCanvas(page, [460, 300], [40, 40])
    expect((await snapshot(page)).selectedIds).toEqual(['r1', 'r2'])
  })

  test('Shift+marquee adds to the current selection', async ({ page }) => {
    await clickCanvas(page, INSIDE_E1)
    await dragOnCanvas(page, [40, 40], [460, 300], { shift: true })
    expect((await snapshot(page)).selectedIds).toEqual(['e1', 'r1', 'r2'])
  })

  test('a plain click on empty canvas clears the selection and does not leave a marquee', async ({ page }) => {
    await clickCanvas(page, INSIDE_R1)
    expect((await snapshot(page)).selectedIds).toEqual(['r1'])
    await clickCanvas(page, [20, 500])
    const s = await snapshot(page)
    expect(s.selectedIds).toEqual([])
    expect(s.marquee).toBeNull()
  })

  test('marquee does not move shapes or add history entries', async ({ page }) => {
    const before = await snapshot(page)
    await dragOnCanvas(page, [40, 40], [460, 300])
    const after = await snapshot(page)
    expect(after.shapes).toEqual(before.shapes)
    expect(after.past).toBe(0)
  })
})

test.describe('Step 2 — align & distribute toolbar', () => {
  const ALIGN = ['align-left', 'align-hcenter', 'align-right', 'align-top', 'align-vcenter', 'align-bottom']
  const DIST = ['distribute-horizontal', 'distribute-vertical']

  test('buttons are enabled only when enough shapes are selected', async ({ page }) => {
    for (const id of [...ALIGN, ...DIST]) await expect(page.getByTestId(id)).toBeDisabled()

    await clickCanvas(page, INSIDE_R1)
    for (const id of [...ALIGN, ...DIST]) await expect(page.getByTestId(id)).toBeDisabled()

    await clickCanvas(page, INSIDE_R2, { shift: true })
    for (const id of ALIGN) await expect(page.getByTestId(id)).toBeEnabled()
    for (const id of DIST) await expect(page.getByTestId(id)).toBeDisabled()

    await clickCanvas(page, INSIDE_E1, { shift: true })
    for (const id of [...ALIGN, ...DIST]) await expect(page.getByTestId(id)).toBeEnabled()
  })

  test('align left moves every selected shape to the left edge of the selection bounds', async ({ page }) => {
    await dragOnCanvas(page, [40, 40], [690, 300]) // r1, r2, e1
    await page.getByTestId('align-left').click()
    expect((await pos(page, 'r1')).x).toBe(80)
    expect((await pos(page, 'r2')).x).toBe(80)
    expect((await pos(page, 'e1')).x).toBe(80)
    // unselected shapes untouched
    expect((await pos(page, 'r3')).x).toBe(700)
    await expect(page.getByTestId('bounds-x')).toHaveText('80')
  })

  test('align vertical centers', async ({ page }) => {
    await dragOnCanvas(page, [40, 40], [690, 300])
    await page.getByTestId('align-vcenter').click()
    // bounds y 80..260, center 170 → r1.y=130, r2.y=120, e1.y=125
    expect((await pos(page, 'r1')).y).toBe(130)
    expect((await pos(page, 'r2')).y).toBe(120)
    expect((await pos(page, 'e1')).y).toBe(125)
  })

  test('distribute horizontally equalises gaps and keeps outer shapes fixed', async ({ page }) => {
    await dragOnCanvas(page, [40, 40], [690, 300])
    await page.getByTestId('distribute-horizontal').click()
    expect((await pos(page, 'r1')).x).toBe(80)
    expect((await pos(page, 'r2')).x).toBe(310)
    expect((await pos(page, 'e1')).x).toBe(520)
  })

  test('each toolbar action is a single undo step', async ({ page }) => {
    await dragOnCanvas(page, [40, 40], [690, 300])
    await page.getByTestId('align-top').click()
    await page.getByTestId('align-left').click()
    expect((await snapshot(page)).past).toBe(2)

    await page.getByTestId('undo').click()
    expect((await pos(page, 'r2')).x).toBe(300) // left align undone
    expect((await pos(page, 'r2')).y).toBe(80) // top align still applied

    await page.getByTestId('undo').click()
    expect((await pos(page, 'r2')).y).toBe(160)

    await page.getByTestId('redo').click()
    expect((await pos(page, 'r2')).y).toBe(80)
  })
})

test.describe('Step 3 — keyboard nudge', () => {
  test('arrow keys move the selection by 1px, Shift+arrow by 10px', async ({ page }) => {
    await clickCanvas(page, INSIDE_R1)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowDown')
    expect(await pos(page, 'r1')).toEqual({ id: 'r1', x: 81, y: 81 })

    await page.keyboard.press('Shift+ArrowLeft')
    await page.keyboard.press('Shift+ArrowUp')
    expect(await pos(page, 'r1')).toEqual({ id: 'r1', x: 71, y: 71 })
  })

  test('nudging a multi-selection moves every selected shape', async ({ page }) => {
    await dragOnCanvas(page, [40, 40], [460, 300]) // r1, r2
    await page.keyboard.press('Shift+ArrowRight')
    expect((await pos(page, 'r1')).x).toBe(90)
    expect((await pos(page, 'r2')).x).toBe(310)
    expect((await pos(page, 'e1')).x).toBe(520)
  })

  test('every nudge is its own undo step and Ctrl+Z reverses it', async ({ page }) => {
    await clickCanvas(page, INSIDE_R1)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Shift+ArrowDown')
    expect((await snapshot(page)).past).toBe(3)

    await page.keyboard.press('Control+z')
    expect(await pos(page, 'r1')).toEqual({ id: 'r1', x: 82, y: 80 })
    await page.keyboard.press('Control+z')
    await page.keyboard.press('Control+z')
    expect(await pos(page, 'r1')).toEqual({ id: 'r1', x: 80, y: 80 })

    await page.keyboard.press('Control+Shift+z')
    expect((await pos(page, 'r1')).x).toBe(81)
  })

  test('arrow keys with nothing selected do nothing and add no history', async ({ page }) => {
    const before = await snapshot(page)
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Shift+ArrowDown')
    const after = await snapshot(page)
    expect(after.shapes).toEqual(before.shapes)
    expect(after.past).toBe(0)
  })
})
