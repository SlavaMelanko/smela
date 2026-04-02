import globals from 'globals'

/** Shared Playwright globals override — covers e2e test files and config. */
export const playwrightConfig = [
  {
    files: ['e2e/**/*.{js,jsx}', 'playwright.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
]
