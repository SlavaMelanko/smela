import {
  reactConfig,
  shadcnConfig,
  storybookConfig,
  vitestConfig
} from '@smela/eslint'

export default [
  ...reactConfig,
  ...shadcnConfig,
  ...vitestConfig,
  ...storybookConfig
]
