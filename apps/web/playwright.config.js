import { defineConfig, devices } from '@playwright/test'

import { loadTestEnv } from './e2e/config/globalSetup'

loadTestEnv()

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/config/globalSetup.js',
  forbidOnly: !!process.env.CI,
  reporter: [['html', { outputFolder: './e2e/html-report' }]],
  outputDir: './e2e/artifacts',
  use: {
    baseURL: process.env.VITE_FE_BASE_URL || 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'en-US'
      }
    }
    //{
    //  name: 'webkit',
    //  use: {
    //    ...devices['Desktop Safari'],
    //    locale: 'uk-UA'
    //  }
    //}
  ],

  webServer: {
    command: 'pnpm run dev',
    url: process.env.VITE_FE_BASE_URL || 'http://localhost:5173',
    timeout: 30000,
    reuseExistingServer: !process.env.CI
  }
})
