import { playwrightConfig, reactConfig, shadcnConfig } from '@smela/eslint'

export default [
  { ignores: ['dist'] },
  ...reactConfig,
  ...shadcnConfig,
  ...playwrightConfig
]
