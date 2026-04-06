import { reactConfig, shadcnConfig, vitestConfig } from '@smela/eslint'
import storybook from 'eslint-plugin-storybook'

export default [
  { ignores: ['dist'] },
  ...reactConfig,
  ...shadcnConfig,
  ...vitestConfig,
  ...storybook.configs['flat/recommended']
]
