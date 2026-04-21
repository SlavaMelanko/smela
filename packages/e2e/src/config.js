import { defineConfig, devices } from '@playwright/test'

export const defineBaseConfig = ({
  testDir,
  baseURL,
  devCommand,
  globalSetup
}) =>
  defineConfig({
    testDir,
    globalSetup,
    forbidOnly: !!process.env.CI,
    reporter: [['html', { outputFolder: './e2e/html-report' }]],
    outputDir: './e2e/artifacts',
    use: {
      baseURL,
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
    ],
    webServer: {
      command: devCommand,
      url: baseURL,
      timeout: 30000,
      reuseExistingServer: !process.env.CI
    }
  })
