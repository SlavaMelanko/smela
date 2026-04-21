import { faker } from '@faker-js/faker'
import {
  fillAcceptInviteFormAndSubmit,
  fillAdminInviteFormAndSubmit,
  fillUpdatePasswordFormAndSubmit,
  logOut
} from '@smela/e2e/actions'
import { waitForApiCall, waitForApiCalls } from '@smela/e2e/api'
import { generateEmailAddress } from '@smela/e2e/email'
import { HttpStatus } from '@smela/ui/lib/net'
import {
  ACCEPT_INVITE_PATH,
  OWNER_ADMINS_PATH,
  UPDATE_PASSWORD_PATH
} from '@smela/ui/services/backend/paths'

import { expect, test } from './config/fixtures'

const ownerCredentials = {
  email: process.env.VITE_E2E_OWNER_EMAIL,
  password: process.env.VITE_E2E_OWNER_PASSWORD
}

test.describe('Owner: Admins Page', () => {
  test('toggling hidden columns keeps data aligned with headers', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    const apiPromise = waitForApiCall(page, {
      path: OWNER_ADMINS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/owner/admins')
    await apiPromise

    const columnsButton = page.getByRole('button', {
      name: t.table.column_plural
    })

    await expect(columnsButton).toBeVisible()

    // ID column is hidden by default — header should not exist yet
    await expect(
      page.getByRole('columnheader', { name: t.table.users.id })
    ).not.toBeVisible()

    const menu = page.getByRole('menu', { name: t.table.column_plural })

    // Show the ID column
    await columnsButton.click()
    await page.getByRole('menuitemcheckbox', { name: t.table.users.id }).click()
    await page.keyboard.press('Escape')
    await expect(menu).not.toBeVisible()

    // Header and first data cell in same column position must align
    await expect(
      page.getByRole('columnheader', { name: t.table.users.id })
    ).toBeVisible()

    const headers = page.getByRole('columnheader')
    const firstRow = page.getByRole('row').nth(1)
    const cells = firstRow.getByRole('cell')

    await expect(headers).toHaveCount(await cells.count())

    // Hide the ID column again
    await columnsButton.click()
    await page.getByRole('menuitemcheckbox', { name: t.table.users.id }).click()
    await page.keyboard.press('Escape')
    await expect(menu).not.toBeVisible()

    await expect(
      page.getByRole('columnheader', { name: t.table.users.id })
    ).not.toBeVisible()

    await expect(headers).toHaveCount(await cells.count())
  })

  test('search filters the admins table', async ({ page, login }) => {
    await login(ownerCredentials)

    const apiPromise = waitForApiCall(page, {
      path: OWNER_ADMINS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/owner/admins')
    await apiPromise

    const searchInput = page.getByRole('searchbox', { name: 'Search' })

    await searchInput.fill('admin')

    await expect(
      page.getByRole('row', { name: /admin@smela\.me/ })
    ).toBeVisible()
  })
})

test.describe.serial('Owner: Admin Invitation', () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  const newAdmin = {
    firstName,
    lastName,
    email: generateEmailAddress({ prefix: firstName }),
    password: process.env.VITE_E2E_DEFAULT_PASSWORD
  }

  test('owner invites admin via modal form', async ({ page, t, login }) => {
    await login(ownerCredentials)

    const apiPromise = waitForApiCall(page, {
      path: OWNER_ADMINS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/owner/admins')
    await apiPromise

    // Click Invite button to open modal
    await page.getByRole('button', { name: t.invite.cta }).click()

    // Verify modal is visible
    await expect(
      page.getByRole('heading', { name: t.invite.send.title.admin })
    ).toBeVisible()

    const apiPromises = waitForApiCalls(page, [
      { path: OWNER_ADMINS_PATH, status: HttpStatus.CREATED },
      { path: OWNER_ADMINS_PATH, status: HttpStatus.OK }
    ])

    await fillAdminInviteFormAndSubmit(page, newAdmin, t)
    await apiPromises

    // Verify success toast
    await expect(page.getByText(t.invite.send.success)).toBeVisible()

    // Verify admin appears in table with Pending status
    const adminRow = page.getByRole('row', {
      name: new RegExp(newAdmin.email)
    })

    await expect(adminRow).toBeVisible()
    await expect(adminRow.getByText(t.status.values.pending)).toBeVisible()

    await logOut(page, t)
  })

  test('invited admin accepts invitation via email link', async ({
    page,
    t,
    emailService
  }) => {
    const { link } = await emailService.waitForInvitationEmail(newAdmin.email)

    await page.goto(link)

    // Verify page title
    await expect(
      page.getByText(
        t.invite.accept.title.replace('{{teamName}}', process.env.VITE_APP_NAME)
      )
    ).toBeVisible()

    const apiPromise = waitForApiCall(page, {
      path: ACCEPT_INVITE_PATH,
      status: HttpStatus.OK
    })

    await fillAcceptInviteFormAndSubmit(page, newAdmin.password, t)
    await apiPromise

    // Verify success toast
    await expect(page.getByText(t.invite.accept.success)).toBeVisible()

    await page.waitForURL('/admin/dashboard')

    await logOut(page, t)
  })

  test('owner verifies admin status changed to active', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    const apiPromise = waitForApiCall(page, {
      path: OWNER_ADMINS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/owner/admins')
    await apiPromise

    // Find the invited admin row and verify status is Active
    const adminRow = page.getByRole('row', {
      name: new RegExp(newAdmin.email)
    })

    await expect(adminRow).toBeVisible()
    await expect(adminRow.getByText(t.status.values.active)).toBeVisible()

    await logOut(page, t)
  })

  test('invited admin can update password via security tab', async ({
    page,
    t,
    login
  }) => {
    await login({ email: newAdmin.email, password: newAdmin.password })

    // Open profile menu and navigate to Profile
    await page.getByRole('button', { name: 'Profile menu' }).click()
    await page.getByRole('menuitem', { name: t.profile.title }).click()

    await page.waitForURL('**/profile*')

    // General tab should be active by default — verify it is visible
    await expect(page.getByRole('tab', { name: t.general })).toBeVisible()

    // Switch to Security tab
    await page.getByRole('tab', { name: t.security }).click()

    const updatedPassword = newAdmin.password + '1'

    const apiPromise = waitForApiCall(page, {
      path: UPDATE_PASSWORD_PATH,
      status: HttpStatus.OK
    })

    await fillUpdatePasswordFormAndSubmit(
      page,
      { currentPassword: newAdmin.password, newPassword: updatedPassword },
      t
    )

    await apiPromise

    await expect(page.getByText(t.changesSaved)).toBeVisible()

    // Verify the new password works by logging out and logging back in
    await logOut(page, t)
    await login({ email: newAdmin.email, password: updatedPassword })

    await logOut(page, t)
  })
})

test.describe('Owner: Admins Page Error Handling', () => {
  test('displays error state when admins API fails', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.route(`**${OWNER_ADMINS_PATH}*`, route =>
      route.fulfill({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        contentType: 'application/json',
        body: JSON.stringify({
          name: 'AppError',
          code: 'system/internal-error'
        })
      })
    )

    await page.goto('/owner/admins')

    await expect(
      page.getByText(t.backend['system/internal-error'])
    ).toBeVisible()

    await expect(page.getByRole('button', { name: t.tryAgain })).toBeVisible()
  })

  test('displays empty table when no admins exist', async ({
    page,
    t,
    login
  }) => {
    await login(ownerCredentials)

    await page.route(`**${OWNER_ADMINS_PATH}*`, route =>
      route.fulfill({
        status: HttpStatus.OK,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0 })
      })
    )

    await page.goto('/owner/admins')

    // Verify table header is visible but no data rows exist
    await expect(
      page.getByRole('columnheader', { name: t.table.users.name })
    ).toBeVisible()

    await expect(page.getByRole('cell')).toHaveCount(0)
  })
})
