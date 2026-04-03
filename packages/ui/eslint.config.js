import { reactConfig, shadcnConfig, vitestConfig } from '@smela/eslint'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  ...reactConfig,
  ...shadcnConfig,
  ...vitestConfig,
  ...storybook.configs['flat/recommended'],
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
