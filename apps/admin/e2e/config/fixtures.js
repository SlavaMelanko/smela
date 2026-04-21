import { test as base } from '@playwright/test'
import { fillLoginFormAndSubmit } from '@smela/e2e/actions'
import { waitForApiCall } from '@smela/e2e/api'
import { EmailService } from '@smela/e2e/email'
import { resources } from '@smela/i18n/resources'
import { HttpStatus } from '@smela/ui/lib/net'
import { LOGIN_PATH } from '@smela/ui/services/backend/paths'

export const test = base.extend({
  t: [resources.en.translation, { scope: 'worker' }],

  emailService: [new EmailService(), { scope: 'worker' }],

  login: async ({ page, t }, use) => {
    const login = async credentials => {
      await page.goto('/login')

      const apiPromise = waitForApiCall(page, {
        path: LOGIN_PATH,
        status: HttpStatus.OK
      })

      await fillLoginFormAndSubmit(page, credentials, t)
      await apiPromise
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(login)
  }
})

export { expect } from '@playwright/test'
