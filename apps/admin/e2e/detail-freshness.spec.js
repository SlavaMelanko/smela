import {
  ADMIN_EMAIL_SENDER_PROFILES_PATH,
  ADMIN_SOCIAL_LINKS_PATH,
  ADMIN_USERS_PATH,
  TEAMS_PATH
} from '@smela/ui/services/backend/paths'

import { expect, test } from './config/fixtures'

const detailPages = [
  {
    name: 'user',
    listPath: '/users',
    apiPath: ADMIN_USERS_PATH,
    key: 'user',
    field: 'nickname'
  },
  {
    name: 'team',
    listPath: '/teams',
    apiPath: TEAMS_PATH,
    key: 'team',
    field: 'name'
  },
  {
    name: 'email sender profile',
    listPath: '/system',
    apiPath: ADMIN_EMAIL_SENDER_PROFILES_PATH,
    key: 'senderProfile',
    field: 'name'
  },
  {
    name: 'social link',
    listPath: '/system',
    apiPath: ADMIN_SOCIAL_LINKS_PATH,
    key: 'socialLink',
    field: 'name',
    tab: 'socialLink'
  }
]

for (const detail of detailPages) {
  test(`refetches ${detail.name} details after opening a row and reloading`, async ({
    page,
    t,
    login
  }) => {
    await login({
      email: process.env.VITE_E2E_OWNER_EMAIL,
      password: process.env.VITE_E2E_OWNER_PASSWORD
    })

    await page.goto(detail.listPath)

    if (detail.tab) {
      await page.getByRole('tab', { name: t[detail.tab].label }).click()
    }

    let version = 0

    // Keep the list row stale while the detail endpoint returns newer values
    await page.route(`**${detail.apiPath}/*`, async route => {
      const response = await route.fetch()
      const body = await response.json()

      version += 1
      body[detail.key][detail.field] = `Fresh ${detail.name} ${version}`
      await route.fulfill({ response, json: body })
    })

    await page.getByRole('row').nth(1).click()

    const input = page.getByRole('textbox', { name: t[detail.field].label })

    await expect(input).toHaveValue(`Fresh ${detail.name} 1`)
    await expect(
      page.getByRole('heading', { name: `Fresh ${detail.name} 1`, exact: true })
    ).toBeVisible()

    await page.reload()

    await expect(input).toHaveValue(`Fresh ${detail.name} 2`)
    await expect(
      page.getByRole('heading', { name: `Fresh ${detail.name} 2`, exact: true })
    ).toBeVisible()
  })
}
