import { test, type Page } from '@playwright/test'

/**
 * Not an acceptance test. Regenerates the reference screenshots in task/assets
 * from the reference implementation. Run with: npx playwright test screenshots
 */

async function origin(page: Page) {
  const box = await page.getByTestId('editor-canvas').boundingBox()
  if (!box) throw new Error('canvas not found')
  return box
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.__editor.getState().reset())
})

test('00 starting state', async ({ page }) => {
  await page.screenshot({ path: 'task/assets/00-start.png' })
})

test('01 marquee in progress', async ({ page }) => {
  const o = await origin(page)
  await page.mouse.move(o.x + 40, o.y + 40)
  await page.mouse.down()
  await page.mouse.move(o.x + 690, o.y + 300, { steps: 8 })
  await page.screenshot({ path: 'task/assets/01-marquee-drag.png' })
  await page.mouse.up()
  await page.screenshot({ path: 'task/assets/02-marquee-result.png' })
})

test('03 align left applied', async ({ page }) => {
  await page.evaluate(() => window.__editor.getState().setSelection(['r1', 'r2', 'e1']))
  await page.getByTestId('align-left').click()
  await page.screenshot({ path: 'task/assets/03-align-left.png' })
})

test('04 distribute horizontally applied', async ({ page }) => {
  await page.evaluate(() => window.__editor.getState().setSelection(['r1', 'r2', 'e1']))
  await page.getByTestId('distribute-horizontal').click()
  await page.screenshot({ path: 'task/assets/04-distribute-horizontal.png' })
})

test('05 toolbar states', async ({ page }) => {
  const bar = page.getByTestId('toolbar')
  await bar.screenshot({ path: 'task/assets/05-toolbar-nothing-selected.png' })
  await page.evaluate(() => window.__editor.getState().setSelection(['r1', 'r2']))
  await bar.screenshot({ path: 'task/assets/06-toolbar-two-selected.png' })
  await page.evaluate(() => window.__editor.getState().setSelection(['r1', 'r2', 'e1']))
  await bar.screenshot({ path: 'task/assets/07-toolbar-three-selected.png' })
})
