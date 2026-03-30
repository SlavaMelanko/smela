import fs from 'node:fs'
import path from 'node:path'

import { test as base } from '@playwright/test'
import { fillLoginFormAndSubmit } from '@smela/e2e/actions'
import { waitForApiCall } from '@smela/e2e/api'
import { EmailService } from '@smela/e2e/es'

import { HttpStatus } from '../../src/lib/net'
import { LOGIN_PATH } from '../../src/services/backend/paths'

const LOCALES_PATH = './public/locales'

const loadTranslations = (locale = 'en') => {
  const filePath = path.join(LOCALES_PATH, `${locale}.json`)

  return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
}

export const test = base.extend({
  t: [loadTranslations(), { scope: 'worker' }],

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
