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
      { label: t.sidebar.dashboard, url: '/dashboard' },
      { label: t.sidebar.users, url: '/users' },
      { label: t.sidebar.teams, url: '/teams' },
      { label: t.sidebar.admins, url: '/owner/admins' },
      { label: t.sidebar.settings, url: '/settings' }
    ]

    for (const { label, url } of items) {
      const item = page.getByRole('button', { name: label })

      await expect(item).toBeVisible()
      await item.click()
      await expect(page).toHaveURL(url)
    }

    await logOut(page, t)
  })
})

test.describe('Admin: Sidebar Navigation', () => {
  test('navigates to all sidebar items', async ({ page, t, login }) => {
    await login(adminCredentials)

    const items = [
      { label: t.sidebar.dashboard, url: '/dashboard' },
      { label: t.sidebar.users, url: '/users' },
      { label: t.sidebar.teams, url: '/teams' },
      { label: t.sidebar.settings, url: '/settings' }
    ]

    for (const { label, url } of items) {
      const item = page.getByRole('button', { name: label })

      await expect(item).toBeVisible()
      await item.click()
      await expect(page).toHaveURL(url)
    }

    const forbiddenItems = [t.sidebar.admins]

    for (const label of forbiddenItems) {
      const item = page.getByRole('button', { name: label })

      await expect(item).not.toBeVisible()
    }

    await logOut(page, t)
  })
})
