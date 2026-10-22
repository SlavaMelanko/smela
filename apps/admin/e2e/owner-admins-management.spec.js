import { faker } from '@faker-js/faker'
import {
  fillAcceptInviteFormAndSubmit,
  fillAdminInviteFormAndSubmit,
  fillUpdatePasswordFormAndSubmit,
  logOut
} from '@smela/e2e/actions'
import {
  createAuthenticatedRequest,
  waitForApiCall,
  waitForApiCalls
} from '@smela/e2e/api'
import { generateEmailAddress } from '@smela/e2e/email'
import { HttpStatus } from '@smela/ui/lib/net'
import {
  ACCEPT_INVITE_PATH,
  LOGIN_PATH,
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

    await page.goto('/admins')
    await apiPromise

    const columnsButton = page.getByRole('button', {
      name: t.table.column_plural
    })

    await expect(columnsButton).toBeVisible()

    await expect(
      page.getByRole('columnheader', { name: t.table.users.fullName })
    ).toBeVisible()

    await expect(
      page.getByRole('columnheader', { name: t.table.users.nickname })
    ).toHaveCount(0)

    await expect(
      page.getByRole('columnheader', { name: t.table.users.email })
    ).toBeVisible()

    await columnsButton.click()
    await page
      .getByRole('menuitemcheckbox', {
        name: t.table.users.nickname,
        exact: true
      })
      .click()

    await page.keyboard.press('Escape')
    await expect(
      page.getByRole('columnheader', { name: t.table.users.nickname })
    ).toBeVisible()

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

  test('search filters the admins table', async ({ page, t, login }) => {
    await login(ownerCredentials)

    const apiPromise = waitForApiCall(page, {
      path: OWNER_ADMINS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/admins')
    await apiPromise

    const searchInput = page.getByRole('searchbox', { name: t.searchBy.users })

    await searchInput.fill('admin')

    await expect(
      page.getByRole('row', { name: /admin@smela\.me/ })
    ).toBeVisible()
  })
})

test.describe.serial('Owner: Invite admin with full access', () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  const newAdmin = {
    firstName,
    lastName,
    email: generateEmailAddress({ prefix: firstName }),
    password: process.env.VITE_E2E_ADMIN_PASSWORD
  }

  test('owner invites admin via modal form', async ({ page, t, login }) => {
    await login(ownerCredentials)

    const apiPromise = waitForApiCall(page, {
      path: OWNER_ADMINS_PATH,
      status: HttpStatus.OK
    })

    await page.goto('/admins')
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
    const [created] = await apiPromises

    expect(created.body.admin.nickname).toBe(newAdmin.firstName)

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
      status: HttpStatus.OK,
      validateResponse: body => {
        const expected = [
          'manage:dashboard',
          'manage:users',
          'manage:teams',
          'view:dashboard',
          'view:users',
          'view:teams'
        ]

        return (
          Array.isArray(body.permissions) &&
          body.permissions.length === expected.length &&
          expected.every(p => body.permissions.includes(p))
        )
      }
    })

    await expect(page.getByLabel(t.nickname.label)).toHaveCount(0)
    await fillAcceptInviteFormAndSubmit(
      page,
      { password: newAdmin.password },
      t
    )

    const { body } = await apiPromise

    expect(body.user.nickname).toBe(newAdmin.firstName)

    // Verify success toast
    await expect(page.getByText(t.invite.accept.success)).toBeVisible()

    await page.waitForURL('/dashboard')

    await logOut(page, t)
  })

  test('invited admin can manage teams resource', async ({
    page,
    t,
    login
  }) => {
    await login({ email: newAdmin.email, password: newAdmin.password })

    await page.goto('/teams')

    // Manage permission: Create team button must be visible
    await expect(
      page.getByRole('button', { name: t.team.add.cta })
    ).toBeVisible()

    // Open the first team row
    await page.getByRole('row').nth(1).click()

    // View + manage permission: Name and description fields must be editable
    await expect(page.getByLabel(t.name.label)).not.toBeDisabled()
    await expect(page.getByLabel(t.description.label)).not.toBeDisabled()

    await logOut(page, t)
  })

  test('invited admin can manage users resource', async ({
    page,
    t,
    login
  }) => {
    await login({ email: newAdmin.email, password: newAdmin.password })

    await page.goto('/users')

    // Open the first user row
    await page.getByRole('row').nth(1).click()

    // View + manage permission: firstName and lastName fields must be editable
    await expect(page.getByLabel(t.firstName.label)).not.toBeDisabled()
    await expect(page.getByLabel(t.lastName.label)).not.toBeDisabled()

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

    await page.goto('/admins')
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
    await page
      .getByRole('button', { name: t.profile.label, exact: true })
      .click()
    await page.getByRole('menuitem', { name: t.profile.title }).click()

    await page.waitForURL('**/profile*')

    // Personal tab should be active by default — verify it is visible
    await expect(page.getByRole('tab', { name: t.personal })).toBeVisible()

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

    await page.goto('/admins')

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

    await page.goto('/admins')

    // Verify table header is visible but no data rows exist
    await expect(
      page.getByRole('columnheader', { name: t.table.users.fullName })
    ).toBeVisible()

    await expect(page.getByRole('cell')).toHaveCount(0)
  })
})

test('Owner: nickname search and optional real names persist through admin updates', async ({
  page,
  login
}) => {
  const loginPromise = waitForApiCall(page, {
    path: LOGIN_PATH,
    method: 'POST',
    status: HttpStatus.OK
  })

  await login(ownerCredentials)
  const { body } = await loginPromise
  const api = createAuthenticatedRequest(page.request, body.accessToken)
  const email = generateEmailAddress({ prefix: 'nicknameadmin' })

  await api(OWNER_ADMINS_PATH, {
    method: 'POST',
    data: { email, permissions: { users: { view: true } } },
    status: HttpStatus.BAD_REQUEST
  })

  const { admin } = await api(OWNER_ADMINS_PATH, {
    method: 'POST',
    data: {
      firstName: 'Nickname',
      email,
      permissions: { users: { view: true } }
    },
    status: HttpStatus.CREATED
  })

  expect(admin.nickname).toBe('Nickname')

  const path = `${OWNER_ADMINS_PATH}/${admin.id}`
  const nickname = `Label ${admin.id}`
  const updated = await api(path, {
    method: 'PATCH',
    data: { nickname: `  ${nickname}  `, firstName: null, lastName: null }
  })

  expect(updated.admin).toMatchObject({
    nickname,
    firstName: null,
    lastName: null
  })

  expect((await api(path)).admin.nickname).toBe(nickname)

  for (const search of [nickname, email, admin.id]) {
    const results = await api(
      `${OWNER_ADMINS_PATH}?search=${encodeURIComponent(search)}`
    )

    expect(results.admins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: admin.id, nickname })
      ])
    )
  }

  const renamed = await api(path, {
    method: 'PATCH',
    data: { firstName: 'Renamed', lastName: 'Administrator' }
  })

  expect(renamed.admin.nickname).toBe(nickname)

  for (const search of ['Renamed', 'Administrator']) {
    const results = await api(`${OWNER_ADMINS_PATH}?search=${search}`)

    expect(results.admins).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: admin.id })])
    )
  }
})

test('Owner: edits nickname and clears real names through the admin form', async ({
  page,
  t,
  login
}) => {
  const loginPromise = waitForApiCall(page, {
    path: LOGIN_PATH,
    method: 'POST',
    status: HttpStatus.OK
  })

  await login(ownerCredentials)
  const { body } = await loginPromise
  const api = createAuthenticatedRequest(page.request, body.accessToken)
  const { admin } = await api(OWNER_ADMINS_PATH, {
    method: 'POST',
    data: {
      firstName: 'Editable',
      lastName: 'Admin',
      email: generateEmailAddress({ prefix: 'editadmin' }),
      permissions: { users: { view: true } }
    },
    status: HttpStatus.CREATED
  })
  const path = `${OWNER_ADMINS_PATH}/${admin.id}`

  await page.goto(`/admins/${admin.id}`)
  const nickname = page.getByLabel(t.nickname.label)
  const firstName = page.getByLabel(t.firstName.label)
  const lastName = page.getByLabel(t.lastName.label)

  await expect(nickname).toHaveValue('Editable')
  await nickname.fill('  Адмін 🌻  ')
  await firstName.fill('')
  await lastName.fill('')
  const updatedPromise = waitForApiCall(page, {
    path,
    method: 'PATCH',
    status: HttpStatus.OK,
    validateRequest: body =>
      body.nickname === 'Адмін 🌻' &&
      body.firstName === null &&
      body.lastName === null
  })

  await page.getByRole('button', { name: t.save, exact: true }).click()
  const { body: updated } = await updatedPromise

  expect(updated.admin).toMatchObject({
    nickname: 'Адмін 🌻',
    firstName: null,
    lastName: null
  })

  await page.reload()
  await expect(nickname).toHaveValue('Адмін 🌻')
  await expect(firstName).toHaveValue('')
  await expect(lastName).toHaveValue('')
})
