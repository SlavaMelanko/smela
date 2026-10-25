import { expect } from '@playwright/test'

// Capture writes in the page instead of reading the system clipboard.
// Clipboard permissions are Chromium-only, so this keeps the helper browser-agnostic
export const copyIdAndVerify = async (page, { id, label }, t) => {
  await page.evaluate(() => {
    navigator.clipboard.writeText = async text => {
      globalThis.copiedText = text
    }
  })

  await page.getByRole('button', { name: t.moreActions, exact: true }).click()
  await page.getByRole('menuitem', { name: label, exact: true }).click()

  const toast = page
    .locator('[data-sonner-toast]')
    .filter({ hasText: t.clipboard.success })

  await expect(toast).toBeVisible()
  expect(await page.evaluate(() => globalThis.copiedText)).toBe(id)

  // Dismiss so the toast doesn't overlap assertions in later steps
  await toast.getByRole('button', { name: 'Close toast' }).click()
  await expect(toast).toBeHidden()
}
