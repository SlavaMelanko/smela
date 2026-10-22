import { faker } from '@faker-js/faker'
import {
  fillLoginFormAndSubmit,
  fillNewPasswordFormAndSubmit,
  fillRequestPasswordResetFormAndSubmit,
  fillSignupFormAndSubmit,
  logOut
} from '@smela/e2e/actions'
import { waitForApiCall, waitForApiCalls } from '@smela/e2e/api'
import { generateEmailAddress } from '@smela/e2e/email'
import { HttpStatus } from '@smela/ui/lib/net'
import { Role, UserStatus } from '@smela/ui/lib/types'
import {
  LOGIN_PATH,
  ME_PATH,
  REFRESH_TOKEN_PATH,
  REQUEST_PASSWORD_RESET_PATH,
  RESEND_VERIFICATION_EMAIL_PATH,
  RESET_PASSWORD_PATH,
  SIGNUP_PATH,
  VERIFY_EMAIL_PATH
} from '@smela/ui/services/backend/paths'

import { expect, test } from './config/fixtures'

/**
 * Serial tests - User lifecycle flow
 * These tests must run in order: signup creates a user, login uses initial password,
 * password reset changes the password.
 */
test.describe.serial('Authentication: User Lifecycle', () => {
  // Credentials for a user created during the signup test.
  // Subsequent tests (login, password reset) depend on this user.
  const nickname = faker.person.firstName()

  const user = {
    nickname,
    email: generateEmailAddress({ prefix: nickname }),
    initialPassword: process.env.VITE_E2E_USER_PASSWORD,
    newPassword: process.env.VITE_E2E_STRONG_PASSWORD
  }

  test('signup: creates account and verifies email', async ({
    page,
    t,
    emailService
  }) => {
    await page.goto('/signup')

    const apiPromise = waitForApiCall(page, {
      path: SIGNUP_PATH,
      status: HttpStatus.CREATED,
      validateRequest: b => !!b.captcha?.token
    })

    await fillSignupFormAndSubmit(
      page,
      {
        nickname: user.nickname,
        email: user.email,
        password: user.initialPassword
      },
      t
    )

    const { body } = await apiPromise

    expect(body.user.nickname).toBe(user.nickname)

    await page.waitForURL(/email-confirmation/)

    const { link } = await emailService.waitForVerificationEmail(user.email)

    expect(link).toBeTruthy()

    // Start listening BEFORE navigation to catch fast responses
    const apiPromises = waitForApiCalls(page, [
      {
        path: ME_PATH,
        status: HttpStatus.OK,
        validateResponse: b => {
          if (!b.user) {
            return false
          }

          const { nickname: actualNickname, email, status, role } = b.user

          return (
            b.user.firstName === null &&
            b.user.lastName === null &&
            actualNickname === user.nickname &&
            email === user.email &&
            status === UserStatus.New &&
            role === Role.User
          )
        }
      },
      {
        path: VERIFY_EMAIL_PATH,
        status: HttpStatus.OK,
        validateResponse: b => {
          if (!b.user || !b.accessToken) {
            return false
          }

          const { nickname: actualNickname, email, status, role } = b.user

          return (
            b.user.firstName === null &&
            b.user.lastName === null &&
            actualNickname === user.nickname &&
            email === user.email &&
            status === UserStatus.Verified &&
            role === Role.User
          )
        }
      }
    ])

    await page.goto(link)
    await apiPromises

    // After verification, user is redirected to home
    await page.waitForURL('/home')

    await expect(page.getByText(t.email.verification.success)).toBeVisible()

    // Logout to ensure clean state for next test
    await logOut(page, t)
  })

  test('login: authenticates with valid credentials and redirects to home', async ({
    page,
    t,
    login
  }) => {
    await login({
      email: user.email,
      password: user.initialPassword
    })

    await page.waitForURL('/home')
    await expect(page).toHaveURL(/\/home/)

    // Logout to ensure clean state for next test
    await logOut(page, t)
  })

  test('password reset: resets password and auto-login', async ({
    page,
    t,
    emailService
  }) => {
    await page.goto('/reset-password')

    await expect(
      page.getByText(t.password.reset.request.description)
    ).toBeVisible()

    let apiPromise = waitForApiCall(page, {
      path: REQUEST_PASSWORD_RESET_PATH,
      status: HttpStatus.ACCEPTED,
      validateRequest: b => !!b.captcha?.token
    })

    await fillRequestPasswordResetFormAndSubmit(page, user.email, t)
    await apiPromise

    await expect(page.getByText(t.password.reset.request.success)).toBeVisible()

    const { link } = await emailService.waitForResetPasswordEmail(user.email)

    expect(link).toBeTruthy()

    await page.goto(link)

    await expect(page.getByText(t.password.reset.set.description)).toBeVisible()

    apiPromise = waitForApiCall(page, {
      path: RESET_PASSWORD_PATH,
      status: HttpStatus.OK
    })

    await fillNewPasswordFormAndSubmit(page, user.newPassword, t)
    await apiPromise

    await expect(page.getByText(t.password.reset.set.success)).toBeVisible()

    // Auto-login redirects to home
    await page.waitForURL('/home')

    // Logout to ensure clean state
    await logOut(page, t)
  })
})

/**
 * Parallel tests - General authentication tests
 * These tests use pre-seeded user credentials and can run independently.
 */
test.describe('Authentication: General', () => {
  // Pre-seeded user credentials from environment variables
  const seededUser = {
    email: process.env.VITE_E2E_USER_EMAIL,
    password: process.env.VITE_E2E_USER_PASSWORD
  }

  test('signup: validates required fields', async ({ page, t }) => {
    await page.goto('/signup')

    const { nicknameInput, emailInput, passwordInput } =
      await fillSignupFormAndSubmit(
        page,
        { nickname: '', email: '', password: '' },
        t
      )

    await expect(page.getByText(t.nickname.error.required)).toBeVisible()
    await expect(nicknameInput).toHaveClass(/border-destructive/)
    await expect(page.getByLabel(t.firstName.label)).toHaveCount(0)
    await expect(page.getByLabel(t.lastName.label)).toHaveCount(0)

    await expect(page.getByText(t.email.error.required)).toBeVisible()
    await expect(emailInput).toHaveClass(/border-destructive/)

    await expect(page.getByText(t.password.error.required)).toBeVisible()
    await expect(passwordInput).toHaveClass(/border-destructive/)
  })

  test('signup: prevents duplicate email registration', async ({ page, t }) => {
    await page.goto('/signup')

    const apiPromise = waitForApiCall(page, {
      path: SIGNUP_PATH,
      status: HttpStatus.CONFLICT
    })

    await fillSignupFormAndSubmit(
      page,
      {
        nickname: faker.person.firstName(),
        email: process.env.VITE_E2E_USER_EMAIL,
        password: process.env.VITE_E2E_USER_PASSWORD
      },
      t
    )

    await apiPromise

    const errorMessage = page.getByText(t.backend['auth/email-already-in-use'])

    await expect(errorMessage).toBeVisible()
  })

  test('signup: resend verification email', async ({
    page,
    t,
    emailService
  }) => {
    await page.goto('/signup')

    const nickname = faker.person.firstName()
    const testEmail = generateEmailAddress({ prefix: nickname })

    let signupCaptchaToken = null

    let apiPromise = waitForApiCall(page, {
      path: SIGNUP_PATH,
      status: HttpStatus.CREATED,
      validateRequest: body => {
        try {
          signupCaptchaToken = body.captcha?.token

          return !!signupCaptchaToken
        } catch {
          return false
        }
      },
      validateResponse: body => {
        if (!body.user || !body.accessToken) {
          return false
        }

        const { nickname: actualNickname, email, status, role } = body.user

        return (
          actualNickname === nickname &&
          email === testEmail &&
          status === UserStatus.New &&
          role === Role.User
        )
      }
    })

    await fillSignupFormAndSubmit(
      page,
      {
        nickname,
        email: testEmail,
        password: process.env.VITE_E2E_USER_PASSWORD
      },
      t
    )

    await apiPromise

    await page.waitForURL(/email-confirmation/)

    await expect(
      page.getByRole('heading', { name: t.email.confirmation.title })
    ).toBeVisible()

    await expect(
      page.getByText(t.email.confirmation.description.start)
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: t.email.confirmation.cta })
    ).toBeVisible()

    const { link: firstLink } =
      await emailService.waitForVerificationEmail(testEmail)

    expect(firstLink).toBeTruthy()

    const firstToken = new URL(firstLink).searchParams.get('token')

    let resendCaptchaToken = null

    apiPromise = waitForApiCall(page, {
      path: RESEND_VERIFICATION_EMAIL_PATH,
      status: HttpStatus.ACCEPTED,
      validateRequest: b => {
        try {
          resendCaptchaToken = b.captcha?.token

          return !!resendCaptchaToken
        } catch {
          return false
        }
      },
      validateResponse: b => b?.success === true
    })

    await page.getByRole('button', { name: t.email.confirmation.cta }).click()
    await apiPromise

    await expect(page.getByText(t.email.confirmation.success)).toBeVisible()

    const { link: secondLink } =
      await emailService.waitForVerificationEmail(testEmail)

    expect(secondLink).toBeTruthy()

    const secondToken = new URL(secondLink).searchParams.get('token')

    // Verify secure tokens differ between responses
    expect(firstToken).not.toBe(secondToken)

    // Verify reCAPTCHA tokens are different between requests
    expect(signupCaptchaToken).not.toBe(resendCaptchaToken)

    // Even if we navigate to the root
    await page.goto('/')
    // The email confirmation page should be shown again
    await expect(page).toHaveURL(/email-confirmation/)
    await expect(
      page.getByRole('heading', { name: t.email.confirmation.title })
    ).toBeVisible()
  })

  test('signup: handles invalid verification link', async ({
    page,
    t,
    emailService
  }) => {
    await page.goto('/signup')

    const nickname = faker.person.firstName()
    const testEmail = generateEmailAddress({ prefix: nickname })

    const apiPromise = waitForApiCall(page, {
      path: SIGNUP_PATH,
      status: HttpStatus.CREATED
    })

    await fillSignupFormAndSubmit(
      page,
      {
        nickname,
        email: testEmail,
        password: process.env.VITE_E2E_USER_PASSWORD
      },
      t
    )

    await apiPromise

    await page.waitForURL(/email-confirmation/)

    const { link } = await emailService.waitForVerificationEmail(testEmail)

    expect(link).toBeTruthy()

    const url = new URL(link)
    const originalToken = url.searchParams.get('token')

    // 1: Empty token — frontend silently redirects to / without API call,
    // then status guard redirects new user back to /email-confirmation
    await page.goto(`${url.origin}${url.pathname}?token=`)
    await page.waitForURL(/email-confirmation/)

    // 2: Malformed token (replace last char with underscore)
    const malformedToken = originalToken.slice(0, -1) + '_'

    // Start listening BEFORE navigation to catch fast responses
    let apiPromises = waitForApiCalls(page, [
      { path: ME_PATH, method: 'GET', status: HttpStatus.OK },
      {
        path: VERIFY_EMAIL_PATH,
        method: 'POST',
        status: HttpStatus.BAD_REQUEST
      }
    ])

    await page.goto(`${url.origin}${url.pathname}?token=${malformedToken}`)
    await apiPromises

    await expect(page.getByText(t.backend['token/not-found'])).toBeVisible()

    // 3: Invalid token (completely wrong token)
    apiPromises = waitForApiCalls(page, [
      { path: ME_PATH, status: HttpStatus.OK },
      { path: VERIFY_EMAIL_PATH, status: HttpStatus.BAD_REQUEST }
    ])

    await page.goto(`${url.origin}${url.pathname}?token=invalid_token_12345`)
    await apiPromises

    await expect(page.getByText(t.backend['validation/error'])).toBeVisible()

    // User should remain on email confirmation page after invalid attempts
    await expect(page).toHaveURL(/email-confirmation/)
    await expect(
      page.getByRole('heading', { name: t.email.confirmation.title })
    ).toBeVisible()
  })

  test('login: shows error with invalid credentials and preserves form data', async ({
    page,
    t
  }) => {
    await page.goto('/login')

    const testCases = [
      {
        email: seededUser.email,
        password: 'Mismatch1!'
      },
      {
        email: 'nonexistent@example.com',
        password: process.env.VITE_E2E_USER_PASSWORD
      }
    ]

    for (const testCase of testCases) {
      await page.reload()

      const apiPromise = waitForApiCall(page, {
        path: LOGIN_PATH,
        status: HttpStatus.UNAUTHORIZED
      })

      const { emailInput, passwordInput } = await fillLoginFormAndSubmit(
        page,
        { email: testCase.email, password: testCase.password },
        t
      )

      await apiPromise

      const errorMessage = page.getByText(t.backend['auth/invalid-credentials'])

      await expect(errorMessage).toBeVisible()

      // Verify that form fields retain their values after error
      await expect(emailInput).toHaveValue(testCase.email)
      await expect(passwordInput).toHaveValue(testCase.password)
    }
  })

  test('reset-password: reachable from login while unauthenticated', async ({
    page,
    t
  }) => {
    await page.goto('/login')

    await page.getByRole('link', { name: t.forgotYourPassword }).click()

    await page.waitForURL(/\/reset-password/)

    await expect(
      page.getByText(t.password.reset.request.description)
    ).toBeVisible()
  })

  test('login: shows info and error notices from url params', async ({
    page,
    t
  }) => {
    const infoCode = 'refresh-token/missing'
    const errorCode = 'auth/google-oauth-failed'

    // Info notice — neutral (e.g. expired session redirect)
    await page.goto(`/login?info=${encodeURIComponent(infoCode)}`)

    const infoNotice = page.getByRole('alert')

    await expect(infoNotice).toHaveText(t.backend[infoCode])
    await expect(infoNotice).not.toHaveClass(/text-destructive/)

    // Error notice — destructive (e.g. Google OAuth failure)
    await page.goto(`/login?error=${encodeURIComponent(errorCode)}`)

    const errorNotice = page.getByRole('alert')

    await expect(errorNotice).toHaveText(t.backend[errorCode])
    await expect(errorNotice).toHaveClass(/text-destructive/)

    // Error takes precedence when both params are present
    await page.goto(
      `/login?info=${encodeURIComponent(infoCode)}&error=${encodeURIComponent(errorCode)}`
    )

    const notice = page.getByRole('alert')

    await expect(notice).toHaveText(t.backend[errorCode])
    await expect(notice).toHaveClass(/text-destructive/)
  })

  test('login: redirects authenticated users from auth pages', async ({
    page,
    t,
    login
  }) => {
    await login(seededUser)

    await page.waitForURL('/home')

    // Verify authenticated users cannot access /login
    await page.goto('/login')
    await page.waitForURL('/home')
    await expect(page).toHaveURL(/\/home/)

    // Verify authenticated users cannot access /signup
    await page.goto('/signup')
    await page.waitForURL('/home')
    await expect(page).toHaveURL(/\/home/)

    // Verify authenticated users cannot access /verify-email
    await page.goto('/verify-email?token=sample_token_12345')
    await page.waitForURL('/home')
    await expect(page).toHaveURL(/\/home/)

    // Logout to ensure clean state for next test
    await logOut(page, t)
  })

  test('verify-email / accept-invite / email-confirmation: redirects unauthenticated users without required context to login', async ({
    page
  }) => {
    const paths = ['/verify-email', '/accept-invite', '/email-confirmation']

    for (const path of paths) {
      await page.goto(path)
      await page.waitForURL('/login')
      await expect(page).toHaveURL(/\/login/)
    }
  })

  test('authorization: shows 404 for unauthorized and unknown routes', async ({
    page,
    t,
    login
  }) => {
    await login(seededUser)

    await page.waitForURL('/home')

    const unauthorizedPaths = ['/unknown', '/admins']

    for (const path of unauthorizedPaths) {
      await page.goto(path)

      await expect(page).toHaveURL(path)
      await expect(page.getByTestId('not-found-error-page')).toBeVisible()

      await page.getByRole('button', { name: t.error.notFound.cta }).click()
      await page.waitForURL('/home')
    }

    await logOut(page, t)
  })

  test('logout: syncs authentication state across tabs', async ({
    page,
    context,
    t,
    login
  }) => {
    await login(seededUser)

    await page.waitForURL('/home')

    // Step 2: Open second tab and navigate to home - should see same page
    const secondTab = await context.newPage()

    await secondTab.goto('/home')

    // Step 3: Logout in first tab - should see login page
    await logOut(page, t)

    await expect(page).toHaveURL(/\/login/)

    // Step 4: Refresh second tab - should redirect to login
    await secondTab.reload()

    await secondTab.waitForURL('/login')

    await expect(secondTab).toHaveURL(/\/login/)

    await secondTab.close()
  })
})

/**
 * Parallel tests - Google OAuth
 * Cover the flows reachable without a real Google round-trip.
 */
test.describe('Authentication: Google OAuth', () => {
  test('signup: prevents email signup for an existing Google account', async ({
    page,
    t
  }) => {
    await page.goto('/signup')

    const apiPromise = waitForApiCall(page, {
      path: SIGNUP_PATH,
      status: HttpStatus.CONFLICT
    })

    await fillSignupFormAndSubmit(
      page,
      {
        nickname: faker.person.firstName(),
        email: process.env.VITE_E2E_USER_GOOGLE_EMAIL,
        password: process.env.VITE_E2E_USER_PASSWORD
      },
      t
    )

    await apiPromise

    await expect(
      page.getByText(t.backend['auth/email-already-in-use'])
    ).toBeVisible()
  })

  test('login: shows error for Google-only account using email login', async ({
    page,
    t
  }) => {
    await page.goto('/login')

    const apiPromise = waitForApiCall(page, {
      path: LOGIN_PATH,
      status: HttpStatus.CONFLICT
    })

    await fillLoginFormAndSubmit(
      page,
      {
        email: process.env.VITE_E2E_USER_GOOGLE_EMAIL,
        password: process.env.VITE_E2E_USER_PASSWORD
      },
      t
    )

    await apiPromise

    await expect(
      page.getByText(t.backend['auth/social-auth-only'])
    ).toBeVisible()
  })

  test('callback: redirects to login with error when session is missing', async ({
    page,
    t
  }) => {
    const apiPromise = waitForApiCall(page, {
      path: REFRESH_TOKEN_PATH,
      status: HttpStatus.BAD_REQUEST
    })

    // No refresh cookie is set without a real OAuth round-trip, so the token
    // exchange fails and routes back to login with a neutral session notice.
    await page.goto('/auth/google/callback')

    await apiPromise
    await page.waitForURL(/\/login/)

    const notice = page.getByRole('alert')

    await expect(notice).toHaveText(t.backend['refresh-token/missing'])
    await expect(notice).not.toHaveClass(/text-destructive/)
  })

  test('callback: shows destructive error when the backend redirects with a failure', async ({
    page,
    t
  }) => {
    const errorCode = 'auth/google-oauth-failed'

    // The backend funnels token-exchange / user-info failures to this redirect
    await page.goto(`/login?error=${encodeURIComponent(errorCode)}`)

    const notice = page.getByRole('alert')

    await expect(notice).toHaveText(t.backend[errorCode])
    await expect(notice).toHaveClass(/text-destructive/)
  })
})

test('Authentication: signs up with a nickname and edits profile names through the form', async ({
  page,
  t,
  emailService
}) => {
  const email = generateEmailAddress({ prefix: 'nickname' })

  await page.goto('/signup')
  const signupPromise = waitForApiCall(page, {
    path: SIGNUP_PATH,
    method: 'POST',
    status: HttpStatus.CREATED,
    validateRequest: body =>
      body.nickname === 'Слава 🌻' &&
      !('firstName' in body) &&
      !('lastName' in body)
  })

  await fillSignupFormAndSubmit(
    page,
    {
      nickname: '  Слава 🌻  ',
      email,
      password: process.env.VITE_E2E_USER_PASSWORD
    },
    t
  )

  const { body } = await signupPromise

  expect(body.user).toMatchObject({
    nickname: 'Слава 🌻',
    firstName: null,
    lastName: null
  })

  const { link } = await emailService.waitForVerificationEmail(email)

  await page.goto(link)
  await page.waitForURL('/home')
  await page.goto('/profile')

  const nickname = page.getByLabel(t.nickname.label)
  const firstName = page.getByLabel(t.firstName.label)
  const lastName = page.getByLabel(t.lastName.label)
  const save = page.getByRole('button', { name: t.save, exact: true })

  await expect(nickname).toHaveValue('Слава 🌻')
  await expect(
    page.getByRole('heading', { name: 'Слава 🌻', exact: true })
  ).toBeVisible()

  await expect(
    page.getByRole('button', { name: t.profile.label, exact: true })
  ).toHaveText('С')

  await expect(firstName).toHaveValue('')
  await expect(lastName).toHaveValue('')

  await nickname.fill('   ')
  await save.click()
  await expect(page.getByText(t.nickname.error.required)).toBeVisible()
  await nickname.fill('x'.repeat(51))
  await save.click()
  await expect(page.getByText(t.nickname.error.max)).toBeVisible()
  await nickname.fill('  Updated 🌻  ')
  await firstName.fill('A'.repeat(51))
  await lastName.fill('B'.repeat(51))
  await save.click()
  await expect(page.getByText(t.firstName.error.max)).toBeVisible()
  await expect(page.getByText(t.lastName.error.max)).toBeVisible()
  await firstName.fill('Changed')
  await lastName.fill('Name')

  const updatedPromise = waitForApiCall(page, {
    path: ME_PATH,
    method: 'PATCH',
    status: HttpStatus.OK
  })

  await save.click()
  const { body: updated } = await updatedPromise

  expect(updated.user).toMatchObject({
    nickname: 'Updated 🌻',
    firstName: 'Changed',
    lastName: 'Name'
  })

  await page.reload()
  await expect(firstName).toHaveValue('Changed')
  await expect(nickname).toHaveValue('Updated 🌻')
  await expect(
    page.getByRole('heading', { name: 'Updated 🌻', exact: true })
  ).toBeVisible()

  await expect(
    page.getByRole('button', { name: t.profile.label, exact: true })
  ).toHaveText('U')

  await firstName.fill('  ')
  await lastName.fill('')
  const clearedPromise = waitForApiCall(page, {
    path: ME_PATH,
    method: 'PATCH',
    status: HttpStatus.OK,
    validateRequest: body =>
      body.firstName === null &&
      body.lastName === null &&
      body.nickname === 'Updated 🌻'
  })

  await save.click()
  const { body: cleared } = await clearedPromise

  expect(cleared.user).toMatchObject({
    nickname: 'Updated 🌻',
    firstName: null,
    lastName: null
  })

  await page.reload()
  await expect(firstName).toHaveValue('')
  await expect(lastName).toHaveValue('')
  await expect(nickname).toHaveValue('Updated 🌻')
})
