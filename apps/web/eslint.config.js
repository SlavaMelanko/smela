import { reactConfig } from '@smela/eslint/react'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  ...reactConfig,
  {
    // Vitest
    files: ['**/*.test.{js,jsx}', 'src/tests/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.vitest,
        ...globals.node,
        global: true
      }
    }
  },
  {
    // Playwright
    files: ['e2e/**/*.{js,jsx}', 'playwright.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    // Build and config files
    files: ['*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  ...storybook.configs['flat/recommended'],
  {
    // shadcn/ui components export both components and variants
    files: ['src/components/ui/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off'
    }
  }
]
