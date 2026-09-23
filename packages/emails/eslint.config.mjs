import { typescriptConfig } from '@smela/eslint/typescript'

export default typescriptConfig({
  type: 'app',
  rules: {
    'ts/strict-boolean-expressions': ['off']
  }
})
