import { defineConfig } from '@playwright/test'
import base from './playwright.config'

/** Regenerates task/assets from the reference implementation. Run on the `solution` branch. */
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: /screenshots\.spec\.ts/,
})
