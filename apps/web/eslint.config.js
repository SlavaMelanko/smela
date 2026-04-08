import { playwrightConfig, reactConfig, shadcnConfig } from '@smela/eslint'

export default [
  ...reactConfig,
  ...shadcnConfig,
  ...playwrightConfig
]
