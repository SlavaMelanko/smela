import antfu from '@antfu/eslint-config'

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
        complexity: ['warn', 10],
        curly: ['error', 'all'],
        'func-style': ['error', 'expression', { allowArrowFunctions: true }],
        'no-console': ['warn'],
        'perfectionist/sort-imports': options.sortImports ?? ['error'],
        'prefer-arrow-callback': ['error'],
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
