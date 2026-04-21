import globals from 'globals'

export const playwrightConfig = [
  {
    files: ['e2e/**/*.{js,jsx}', '**/playwright.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
]
