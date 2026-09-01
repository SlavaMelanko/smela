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
    await page.getByRole('row', { name: /Facebook/ }).click()

    // The route uses the social link's immutable id, not its (renamable) name
    await expect(page).toHaveURL(/\/system\/social-links\/[\w-]+$/)

    await expect(page.getByRole('heading', { name: 'Facebook' })).toBeVisible()

    await expect(
      page.getByRole('link', { name: 'https://facebook.com/smela' })
    ).toBeVisible()

    const nameInput = page.getByRole('textbox', {
      name: t.name.label
    })

    await expect(nameInput).toHaveValue('Facebook')

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

  test('keeps the detail page working after renaming the social link', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.getByRole('button', { name: t.sidebar.system }).click()
    await expect(page).toHaveURL('/system')

    await page.getByRole('tab', { name: t.system.tabs.socialLinks }).click()

    // Matches the social link seeded by apps/api/src/data/scripts/seed.ts
    await page.getByRole('row', { name: /LinkedIn/ }).click()

    const nameInput = page.getByRole('textbox', {
      name: t.name.label
    })

    await expect(nameInput).toHaveValue('LinkedIn')

    const { pathname: pathBeforeRename } = new URL(page.url())

    await nameInput.fill('LinkedIn HQ')
    await page.getByRole('button', { name: t.save }).click()

    await expect(page.getByText(t.changesSaved)).toBeVisible()

    // Renaming must not change the URL — the route is keyed by id, not name
    await expect(page).toHaveURL(pathBeforeRename)

    await page.reload()

    await expect(
      page.getByRole('heading', { name: 'LinkedIn HQ' })
    ).toBeVisible()

    await expect(nameInput).toHaveValue('LinkedIn HQ')

    // Revert so the seed stays reusable for other runs
    await nameInput.fill('LinkedIn')
    await page.getByRole('button', { name: t.save }).click()
    await expect(page.getByText(t.changesSaved)).toBeVisible()

    await logOut(page, t)
  })
})
