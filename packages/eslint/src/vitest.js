import globals from 'globals'

/** Shared Vitest globals override — covers standard test file patterns and test utilities. */
export const vitestConfig = [
  {
    files: [
      '**/*.test.{js,jsx}',
      'src/tests/**/*.{js,jsx}',
      'vitest.config.js'
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.vitest,
        ...globals.node,
        global: true
      }
    }
  }
]
