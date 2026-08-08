import { logOut } from '@smela/e2e/actions'

import { expect, test } from './config/fixtures'

const ownerCredentials = {
  email: process.env.VITE_E2E_OWNER_EMAIL,
  password: process.env.VITE_E2E_OWNER_PASSWORD
}

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

    for (const profile of Object.values(t.emailSenderProfile.profile.values)) {
      await expect(
        page.getByRole('cell', { name: profile, exact: true })
      ).toBeVisible()
    }

    await logOut(page, t)
  })
})
