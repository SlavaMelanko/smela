import { logOut } from '@smela/e2e/actions'

import { expect, test } from './config/fixtures'

const ownerCredentials = {
  email: process.env.VITE_E2E_OWNER_EMAIL,
  password: process.env.VITE_E2E_OWNER_PASSWORD
}

const adminCredentials = {
  email: process.env.VITE_E2E_ADMIN_EMAIL,
  password: process.env.VITE_E2E_ADMIN_PASSWORD
}

test.describe('Owner: Sidebar Navigation', () => {
  test('navigates to all sidebar items', async ({ page, t, login }) => {
    await login(ownerCredentials)

    const items = [
      { label: t.sidebar.dashboard, url: '/admin/dashboard' },
      { label: t.sidebar.users, url: '/admin/users' },
      { label: t.sidebar.teams, url: '/admin/teams' },
      { label: t.sidebar.admins, url: '/owner/admins' },
      { label: t.sidebar.settings, url: '/admin/settings' }
    ]

    for (const { label, url } of items) {
      await page.getByRole('button', { name: label }).click()
      await expect(page).toHaveURL(url)
    }

    await logOut(page, t)
  })
})

test.describe('Admin: Sidebar Navigation', () => {
  test('navigates to all sidebar items', async ({ page, t, login }) => {
    await login(adminCredentials)

    const items = [
      { label: t.sidebar.dashboard, url: '/admin/dashboard' },
      { label: t.sidebar.users, url: '/admin/users' },
      { label: t.sidebar.teams, url: '/admin/teams' },
      { label: t.sidebar.settings, url: '/admin/settings' }
    ]

    for (const { label, url } of items) {
      await page.getByRole('button', { name: label }).click()
      await expect(page).toHaveURL(url)
    }

    await expect(
      page.getByRole('button', { name: t.sidebar.admins })
    ).not.toBeVisible()

    await logOut(page, t)
  })
})
