import { typescriptConfig } from '@smela/eslint/typescript'

export default typescriptConfig({
  type: 'app',
  ignores: ['src/data/migrations/**', '**/*.md'],
  sortImports: [
    'error',
    {
      internalPattern: ['^@/']
    }
  ],
  filenameCaseIgnore: ['CLAUDE.md', 'WARP.md'],
  rules: {
    'ts/strict-boolean-expressions': ['off'],
    'node/no-process-env': ['error'],
    'node/prefer-global/process': ['off']
  }
})
