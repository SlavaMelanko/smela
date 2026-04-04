import { reactConfig, vitestConfig } from '@smela/eslint'
import storybook from 'eslint-plugin-storybook'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  ...reactConfig,
  ...vitestConfig,
  ...storybook.configs['flat/recommended'],
  {
    files: ['*.config.js'],
    languageOptions: { globals: { ...globals.node } }
  }
]
