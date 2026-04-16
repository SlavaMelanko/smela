import js from '@eslint/js'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'

export const baseRules = {
  ...js.configs.recommended.rules,
  'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  'prefer-const': 'error',
  'no-unsafe-optional-chaining': 'error',
  curly: ['error', 'all'],
  'simple-import-sort/imports': 'error',
  'simple-import-sort/exports': 'error',
  'padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: '*', next: 'return' },
    {
      blankLine: 'always',
      prev: ['import', 'const', 'let', 'var'],
      next: '*'
    },
    {
      blankLine: 'any',
      prev: ['import', 'const', 'let', 'var'],
      next: ['import', 'const', 'let', 'var']
    },
    {
      blankLine: 'always',
      prev: '*',
      next: ['if', 'for', 'while', 'switch', 'try']
    },
    {
      blankLine: 'always',
      prev: ['block', 'block-like', 'function', 'multiline-expression'],
      next: '*'
    },
    { blankLine: 'always', prev: '*', next: 'function' }
  ]
}

export const basePlugins = {
  'simple-import-sort': simpleImportSort
}

export const baseConfig = [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/.vite/**',
      '**/coverage/**',
      '**/html-report/**',
      '**/*.min.js'
    ]
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node
    },
    plugins: basePlugins,
    rules: baseRules
  }
]
