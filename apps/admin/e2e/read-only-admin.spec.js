import { logOut } from '@smela/e2e/actions'
import { waitForApiCall } from '@smela/e2e/api'
import { HttpStatus } from '@smela/ui/lib/net'
import {
  ADMIN_TEAMS_PATH,
  ME_PATH,
  TEAMS_PATH
} from '@smela/ui/services/backend/paths'

import { expect, test } from './config/fixtures'

const supportCredentials = {
  email: process.env.VITE_E2E_SUPPORT_EMAIL,
  password: process.env.VITE_E2E_SUPPORT_PASSWORD
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

test.describe('Read-Only Admin: Teams', () => {
  test('Add team button is not visible', async ({ page, t, login }) => {
    await login(supportCredentials)

    const apiPromise = waitForApiCall(page, {
      path: ADMIN_TEAMS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/admin/teams')
    await apiPromise

    await expect(page.getByRole('button', { name: t.add })).not.toBeVisible()

    await logOut(page, t)
  })

  test('Team general form fields are read-only and Invite button is hidden', async ({
    page,
    t,
    login
  }) => {
    await login(supportCredentials)

    const pageLoadPromise = waitForApiCall(page, {
      path: ADMIN_TEAMS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/admin/teams')
    await pageLoadPromise

    // Open first team row
    const firstRow = page.getByRole('row').nth(1)

    const detailPromise = waitForApiCall(page, {
      path: TEAMS_PATH.replace(':teamId', ''),
      method: 'GET',
      status: HttpStatus.OK
    })

    await firstRow.click()
    await detailPromise

    // General tab: fields must be read-only (not editable), Save button hidden
    await expect(page.getByLabel(t.team.name.label)).toHaveAttribute(
      'readonly',
      ''
    )

    await expect(page.getByLabel(t.team.website.label)).toHaveAttribute(
      'readonly',
      ''
    )

    await expect(page.getByLabel(t.team.description.label)).toHaveAttribute(
      'readonly',
      ''
    )

    await expect(page.getByRole('button', { name: t.save })).not.toBeVisible()

    // Members tab: Invite button hidden
    await page.getByRole('tab', { name: t.team.tabs.members.label }).click()
    await expect(
      page.getByRole('button', { name: t.invite.cta })
    ).not.toBeVisible()

    await logOut(page, t)
  })

  test('Member row context menu shows only Open action', async ({
    page,
    t,
    login
  }) => {
    await login(supportCredentials)

    await page.goto('/admin/teams')

    await page.getByRole('searchbox', { name: 'Search' }).fill('Wisozk - Sipes')
    await expect(page.getByRole('row')).toHaveCount(2) // header + 1 result
    await page.getByRole('row').nth(1).click()
    await page.getByRole('tab', { name: t.team.tabs.members.label }).click()

    const memberRow = page.getByRole('row').nth(1)

    await expect(memberRow).toBeVisible()

    // Right-click first member row to open context menu
    await memberRow.click({ button: 'right' })

    await expect(
      page.getByRole('menuitem', { name: t.contextMenu.open })
    ).toBeVisible()

    await expect(
      page.getByRole('menuitem', { name: t.contextMenu.invite })
    ).not.toBeVisible()

    await expect(
      page.getByRole('menuitem', { name: t.contextMenu.remove })
    ).not.toBeVisible()

    // Close context menu
    await page.keyboard.press('Escape')

    await logOut(page, t)
  })
})
