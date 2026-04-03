import { playwrightConfig, reactConfig, shadcnConfig } from '@smela/eslint'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  ...reactConfig,
  ...shadcnConfig,
  ...playwrightConfig,
  {
    // Build and config files
    files: ['*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
]
