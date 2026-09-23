import antfu from '@antfu/eslint-config'

const memberOrdering = [
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
]

export const typescriptConfig = (options = {}, ...userConfigs) =>
  antfu(
    {
      type: options.type ?? 'lib',
      typescript: {
        tsconfigPath: options.tsconfigPath ?? './tsconfig.json'
      },
      formatters: false,
      stylistic: false,
      ignores: options.ignores,
      rules: {
        // func-style requires arrow expressions; antfu/top-level-function
        // requires function declarations for top-level functions. Disabled
        // here so the two defaults don't fight every TS package that adopts
        // func-style.
        'antfu/top-level-function': ['off'],
        complexity: ['warn', 10],
        curly: ['error', 'all'],
        'func-style': ['error', 'expression', { allowArrowFunctions: true }],
        'no-console': ['warn'],
        'padding-line-between-statements': [
          'error',
          { blankLine: 'always', prev: '*', next: 'return' }
        ],
        'perfectionist/sort-imports': options.sortImports ?? ['error'],
        'prefer-arrow-callback': ['error'],
        'ts/member-ordering': memberOrdering,
        'ts/no-deprecated': ['error'],
        'unicorn/filename-case': [
          'error',
          {
            case: 'kebabCase',
            ignore: ['README.md', '__tests__', ...(options.filenameCaseIgnore ?? [])]
          }
        ],
        ...options.rules
      }
    },
    {
      files: ['**/*.test.ts', '**/__tests__/**'],
      rules: {
        'ts/no-unsafe-argument': ['off'],
        'ts/no-unsafe-assignment': ['off'],
        'ts/no-unsafe-call': ['off'],
        'ts/no-unsafe-member-access': ['off']
      }
    },
    ...userConfigs
  )
