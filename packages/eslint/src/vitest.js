import globals from 'globals'

export const vitestConfig = [
  {
    files: [
      '**/*.test.{js,jsx}',
      'src/tests/**/*.{js,jsx}',
      '**/vitest.config.js'
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
