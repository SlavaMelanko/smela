import { logOut } from '@smela/e2e/actions'
import { waitForApiCall } from '@smela/e2e/api'
import { HttpStatus } from '@smela/ui/lib/net'
import { ME_PATH } from '@smela/ui/services/backend/paths'

import { expect, test } from './config/fixtures'

const supportCredentials = {
  email: process.env.VITE_E2E_SUPPORT_EMAIL,
  password: process.env.VITE_E2E_SUPPORT_PASSWORD
}

const searchAndOpen = async (page, query) => {
  await page.getByRole('searchbox', { name: 'Search' }).fill(query)
  await expect(page.getByRole('row')).toHaveCount(2) // header + 1 result
  await page.getByRole('row').nth(1).click()
}

test.describe('Read-Only Admin: Authentication', () => {
  test('Login returns only view:teams and view:users permissions', async ({
    page,
    login
  }) => {
    await login(supportCredentials)

    const mePromise = waitForApiCall(page, {
      path: ME_PATH,
      status: HttpStatus.OK,
      validateResponse: body => {
        const expected = ['view:teams', 'view:users']

        return (
          Array.isArray(body.permissions) &&
          body.permissions.length === expected.length &&
          expected.every(p => body.permissions.includes(p))
        )
      }
    })

    await page.reload()
    await mePromise
  })
})

test.describe('Read-Only Admin: Users', () => {
  test.beforeEach(async ({ login }) => {
    await login(supportCredentials)
  })

  test.afterEach(async ({ page, t }) => {
    await logOut(page, t)
  })

  test('User profile form fields are read-only and Save button is hidden', async ({
    page,
    t
  }) => {
    await page.goto('/users')
    await page.getByRole('row').nth(1).click()

    // Profile tab: fields must be read-only, Save button hidden
    for (const label of [t.firstName.label, t.lastName.label]) {
      await expect(page.getByLabel(label)).toHaveAttribute('readonly', '')
    }

    await expect(page.getByLabel(t.status.name)).toHaveAttribute(
      'aria-readonly',
      'true'
    )

    await expect(page.getByRole('button', { name: t.save })).not.toBeVisible()
  })

  test('User membership form fields are read-only and Remove button is hidden', async ({
    page,
    t
  }) => {
    // Navigate via the team members list to get a user with a membership
    await page.goto('/teams')
    await searchAndOpen(page, 'Wisozk - Sipes')
    await page.getByRole('tab', { name: t.team.tabs.members.label }).click()

    const memberRow = page.getByRole('row').nth(1)

    await expect(memberRow).toBeVisible()
    await memberRow.click()

    await page.getByRole('tab', { name: t.membership }).click()

    // Membership tab: Position field read-only, Save and Remove buttons hidden
    await expect(page.getByLabel(t.position.label)).toHaveAttribute(
      'readonly',
      ''
    )

    await expect(page.getByRole('button', { name: t.save })).not.toBeVisible()

    await expect(
      page.getByRole('button', { name: t.team.members.remove.cta })
    ).not.toBeVisible()
  })
})

test.describe('Read-Only Admin: Teams', () => {
  test.beforeEach(async ({ login }) => {
    await login(supportCredentials)
  })

  test.afterEach(async ({ page, t }) => {
    await logOut(page, t)
  })

  test('Add team button is not visible', async ({ page, t }) => {
    await page.goto('/teams')

    await expect(page.getByRole('button', { name: t.add })).not.toBeVisible()
  })

  test('Team general form fields are read-only and Invite button is hidden', async ({
    page,
    t
  }) => {
    await page.goto('/teams')
    // Open first team row
    await page.getByRole('row').nth(1).click()

    // General tab: fields must be read-only, Save button hidden
    for (const label of [
      t.team.name.label,
      t.team.website.label,
      t.team.description.label
    ]) {
      await expect(page.getByLabel(label)).toHaveAttribute('readonly', '')
    }

    await expect(page.getByRole('button', { name: t.save })).not.toBeVisible()

    // Members tab: Invite button hidden
    await page.getByRole('tab', { name: t.team.tabs.members.label }).click()
    await expect(
      page.getByRole('button', { name: t.invite.cta })
    ).not.toBeVisible()
  })

  test('Member row context menu shows only Open action', async ({
    page,
    t
  }) => {
    await page.goto('/teams')
    await searchAndOpen(page, 'Wisozk - Sipes')
    await page.getByRole('tab', { name: t.team.tabs.members.label }).click()

    const memberRow = page.getByRole('row').nth(1)

    await expect(memberRow).toBeVisible()
    // Right-click first member row to open context menu
    await memberRow.click({ button: 'right' })

    // Check visible menu items
    for (const name of [t.contextMenu.open]) {
      await expect(page.getByRole('menuitem', { name })).toBeVisible()
    }

    // Check hidden menu items
    for (const name of [t.contextMenu.invite, t.contextMenu.remove]) {
      await expect(page.getByRole('menuitem', { name })).not.toBeVisible()
    }

    // Close context menu
    await page.keyboard.press('Escape')
  })
})
