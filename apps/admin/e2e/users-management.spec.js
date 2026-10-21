import { createAuthenticatedRequest, waitForApiCall } from '@smela/e2e/api'
import { HttpStatus } from '@smela/ui/lib/net'
import { ADMIN_USERS_PATH, LOGIN_PATH } from '@smela/ui/services/backend/paths'

import { expect, test } from './config/fixtures'

test('Admin: edits a user nickname and clears real names through the form', async ({
  page,
  t,
  login
}) => {
  const loginPromise = waitForApiCall(page, {
    path: LOGIN_PATH,
    method: 'POST',
    status: HttpStatus.OK
  })

  await login({
    email: process.env.VITE_E2E_ADMIN_EMAIL,
    password: process.env.VITE_E2E_ADMIN_PASSWORD
  })

  const { body } = await loginPromise
  const api = createAuthenticatedRequest(page.request, body.accessToken)
  const email = process.env.VITE_E2E_USER_EMAIL
  const { users } = await api(
    `${ADMIN_USERS_PATH}?search=${encodeURIComponent(email)}`
  )
  const user = users.find(user => user.email === email)

  expect(user).toBeTruthy()
  const path = `${ADMIN_USERS_PATH}/${user.id}`

  try {
    await page.goto(`/users/${user.id}`)
    const nickname = page.getByLabel(t.nickname.label)
    const firstName = page.getByLabel(t.firstName.label)
    const lastName = page.getByLabel(t.lastName.label)

    await expect(nickname).toHaveValue(user.nickname)
    // Populate both names first so clearing proves persistence even if the seed has no names
    await api(path, {
      method: 'PATCH',
      data: { firstName: 'Editable', lastName: 'User' }
    })

    await page.reload()
    await expect(firstName).toHaveValue('Editable')
    await expect(lastName).toHaveValue('User')
    await nickname.fill('  Користувач 🌻  ')
    await firstName.fill('')
    await lastName.fill('')
    const updatedPromise = waitForApiCall(page, {
      path,
      method: 'PATCH',
      status: HttpStatus.OK,
      validateRequest: body =>
        body.nickname === 'Користувач 🌻' &&
        body.firstName === null &&
        body.lastName === null
    })

    await page.getByRole('button', { name: t.save, exact: true }).click()
    const { body: updated } = await updatedPromise

    expect(updated.user).toMatchObject({
      nickname: 'Користувач 🌻',
      firstName: null,
      lastName: null
    })

    await page.reload()
    await expect(nickname).toHaveValue('Користувач 🌻')
    await expect(firstName).toHaveValue('')
    await expect(lastName).toHaveValue('')
  } finally {
    await api(path, {
      method: 'PATCH',
      data: {
        nickname: user.nickname,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })
  }
})
