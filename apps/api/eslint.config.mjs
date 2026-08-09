import { typescriptConfig } from '@smela/eslint/typescript'

export default typescriptConfig({
  type: 'app',
  ignores: [
    'src/data/migrations/**',
    'scripts/**',
    '**/*.md',
    'coverage/**',
    '.env*'
  ],
  sortImports: [
    'error',
    {
      internalPattern: ['^@/']
    }
  ],
  filenameCaseIgnore: ['CLAUDE.md', 'WARP.md'],
  rules: {
    'antfu/top-level-function': ['off'],
    'ts/strict-boolean-expressions': ['off'],
    'no-return-await': ['error'],
    'node/no-process-env': ['error'],
    'node/prefer-global/process': ['off'],
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: 'return' }
    ],
    'ts/member-ordering': [
      'error',
      {
        default: [
          // Static fields
          'public-static-field',
          'protected-static-field',
          'private-static-field',
          // Instance fields
          'public-instance-field',
          'protected-instance-field',
          'private-instance-field',
          // Constructor
          'constructor',
          // Static methods
          'public-static-method',
          'protected-static-method',
          'private-static-method',
          // Instance methods
          'public-instance-method',
          'protected-instance-method',
          'private-instance-method'
        ]
      }
    ],
    'ts/no-unsafe-argument': ['error'],
    'ts/no-unsafe-assignment': ['error'],
    'ts/no-unsafe-call': ['error'],
    'ts/no-unsafe-member-access': ['error'],
    'ts/prefer-ts-expect-error': ['error']
  }
})
