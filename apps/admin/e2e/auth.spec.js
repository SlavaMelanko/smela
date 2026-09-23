import { expect, test } from './config/fixtures'

test.describe('Auth', () => {
  test('login page has no signup prompt and no Google login button', async ({
    page,
    t
  }) => {
    await page.goto('/login')

    await expect(page.getByText(t.doNotHaveAccount)).toHaveCount(0)
    await expect(page.getByTestId('google-oauth-button')).toHaveCount(0)
  })

  test('/signup route renders 404 page', async ({ page, t }) => {
    await page.goto('/signup')

    await expect(page.getByTestId('not-found-error-page')).toBeVisible()
    await expect(page.getByText(t.error.notFound.title)).toBeVisible()
  })
})
