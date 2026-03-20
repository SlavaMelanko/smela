import { expect, test } from '@playwright/test'

test.describe('Appearance', () => {
  test('theme toggle: switches from light to dark on login page', async ({
    page
  }) => {
    await page.goto('/login')

    // Verify initial state is light theme (default)
    const html = page.locator('html')

    await expect(html).toHaveClass(/light/)
    await expect(html).not.toHaveClass(/dark/)

    // Click theme toggle button
    const themeToggle = page.getByRole('button', { name: 'Theme toggle' })

    await themeToggle.click()

    // Verify theme changed to dark
    await expect(html).toHaveClass(/dark/)
    await expect(html).not.toHaveClass(/light/)

    // Verify localStorage persistence
    const savedTheme = await page.evaluate(() => localStorage.getItem('theme'))

    expect(savedTheme).toBe('dark')

    // Verify theme persists after page reload
    await page.reload()
    await expect(html).toHaveClass(/dark/)
    await expect(html).not.toHaveClass(/light/)
  })

  test('language dropdown: switches from English to Ukrainian', async ({
    page
  }) => {
    await page.goto('/login')

    // Verify initial locale is English (default)
    const html = page.locator('html')

    await expect(html).toHaveAttribute('lang', 'en')

    // Open language dropdown
    const languageDropdown = page.getByRole('button', {
      name: 'Change language'
    })

    await languageDropdown.click()

    // Select Ukrainian
    await page.getByRole('menuitemradio', { name: 'Українська' }).click()

    // Verify locale changed to Ukrainian
    await expect(html).toHaveAttribute('lang', 'uk')

    // Verify localStorage persistence
    const savedLocale = await page.evaluate(() =>
      localStorage.getItem('locale')
    )

    expect(savedLocale).toBe('uk')

    // Verify locale persists after page reload
    await page.reload()
    await expect(html).toHaveAttribute('lang', 'uk')
  })
})
