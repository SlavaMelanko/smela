import { logOut } from '@smela/e2e/actions'

import { expect, test } from './config/fixtures'

const ownerCredentials = {
  email: process.env.VITE_E2E_OWNER_EMAIL,
  password: process.env.VITE_E2E_OWNER_PASSWORD
}

// Matches profiles seeded by apps/api/src/data/scripts/seed.ts
const seededEmailSenderProfiles = ['System', 'Support', 'Security']

test.describe('Owner: System', () => {
  test('shows page header and seeded email sender profiles', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await expect(page).toHaveURL('/system')

    await expect(
      page.getByRole('heading', { name: t.system.title })
    ).toBeVisible()

    await expect(page.getByText(t.system.description)).toBeVisible()

    // Table must list every seeded sender profile
    await expect(page.getByRole('table')).toBeVisible()

    for (const profile of seededEmailSenderProfiles) {
      await expect(
        page.getByRole('cell', { name: profile, exact: true })
      ).toBeVisible()
    }

    await logOut(page, t)
  })

  test('shows seeded social links', async ({ page, t, login }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await expect(page).toHaveURL('/system')

    await page.getByRole('tab', { name: t.system.tabs.socialLinks }).click()

    await expect(page.getByRole('table')).toBeVisible()

    // Row 0 is the header — at least one data row must be seeded
    await expect(page.getByRole('row').nth(1)).toBeVisible()

    await logOut(page, t)
  })

  test('shows social link details with icon editor', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await expect(page).toHaveURL('/system')

    await page.getByRole('tab', { name: t.system.tabs.socialLinks }).click()

    // Matches the social link seeded by apps/api/src/data/scripts/seed.ts
    await page.getByRole('row', { name: /facebook/ }).click()

    await expect(page).toHaveURL('/system/social-links/facebook')

    await expect(page.getByRole('heading', { name: 'facebook' })).toBeVisible()

    await expect(
      page.getByRole('link', { name: 'https://facebook.com/smela' })
    ).toBeVisible()

    const networkInput = page.getByRole('textbox', {
      name: t.socialLink.network.label
    })

    await expect(networkInput).toHaveValue('facebook')

    const urlInput = page.getByRole('textbox', { name: t.socialLink.url.label })

    await expect(urlInput).toHaveValue('https://facebook.com/smela')

    // Icon editor shows the raw SVG markup and a live preview
    const svgTextarea = page.getByRole('textbox', {
      name: t.socialLink.svg.label
    })

    await expect(svgTextarea).toHaveValue(/<svg[\s\S]*<\/svg>/)

    await expect(page.getByText(t.createdAt)).toBeVisible()
    await expect(page.getByText(t.updatedAt)).toBeVisible()

    await logOut(page, t)
  })
})
